# WealthAI - Deployment & DevOps Guide

## 📋 Table of Contents

- [Infrastructure Overview](#infrastructure-overview)
- [Development Environment](#development-environment)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Monitoring & Alerts](#monitoring--alerts)
- [Backup & Recovery](#backup--recovery)
- [Scaling Strategy](#scaling-strategy)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Infrastructure Overview

### Cloud Provider: AWS

**Services Used:**
- **Compute**: ECS (Elastic Container Service) on EC2
- **Database**: RDS (PostgreSQL 15)
- **Cache**: ElastiCache (Redis)
- **Storage**: S3
- **CDN**: CloudFront
- **Messaging**: SQS
- **Monitoring**: CloudWatch, Prometheus, Grafana
- **Logging**: CloudWatch Logs, ELK Stack
- **Load Balancing**: ALB (Application Load Balancer)
- **DNS**: Route 53
- **Secrets**: AWS Secrets Manager

### Architecture

```
Internet → Route 53 → CloudFront → ALB → ECS Cluster
                           ↓
                        S3 (static assets)

ECS Cluster:
├── Auth Service (2 tasks)
├── Expense Service (3 tasks)
├── Shopping Service (2 tasks)
├── Investment Service (2 tasks)
├── AI Service (2 tasks)
├── Notification Service (1 task)
├── Analytics Service (2 tasks)
└── API Gateway (2 tasks)

Data Layer:
├── RDS PostgreSQL (primary + read replicas)
├── ElastiCache Redis Cluster
├── S3 (receipts, documents)
└── Elasticsearch Cluster (logs)

Async Processing:
├── SQS (message queue)
└── Lambda (scheduled jobs)
```

---

## 🛠️ Development Environment

### Prerequisites

```bash
# Install tools
- Docker Desktop 4.0+
- Node.js 18+
- Python 3.9+
- PostgreSQL client tools
- AWS CLI v2
- kubectl 1.27+
```

### Local Setup

```bash
# Clone repository
git clone https://github.com/wealthai/wealthai.git
cd wealthai

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Setup environment
cp .env.example .env
# Edit .env with local config

# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start dev servers
npm run dev
```

### .env.local Example

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wealthai_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# API Keys
CLAUDE_API_KEY=your_key_here
PLAID_CLIENT_ID=your_id_here
PLAID_SECRET=your_secret_here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Node
NODE_ENV=development
PORT=3000
```

### Docker Compose Files

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: wealthai_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - DB_HOST=postgres
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app

volumes:
  postgres_data:
  elasticsearch_data:
```

---

## 📦 Staging Deployment

### Infrastructure Setup

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create subnets
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create security group
aws ec2 create-security-group \
  --group-name wealthai-staging-sg \
  --description "WealthAI Staging Security Group" \
  --vpc-id vpc-xxx

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier wealthai-staging-postgres \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username postgres \
  --allocated-storage 100 \
  --db-name wealthai_staging

# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id wealthai-staging-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### Deployment Pipeline

```yaml
# .github/workflows/deploy-staging.yml

name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/wealthai-api:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/wealthai-api:$IMAGE_TAG
          
          docker build -t $ECR_REGISTRY/wealthai-frontend:$IMAGE_TAG ./frontend
          docker push $ECR_REGISTRY/wealthai-frontend:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster wealthai-staging \
            --service wealthai-api-service \
            --force-new-deployment
      
      - name: Run smoke tests
        run: |
          npm run test:smoke
      
      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Staging deployment: ${{ job.status }}"
            }
```

### Manual Staging Deployment

```bash
# Build images
docker build -t wealthai-api:latest ./backend
docker build -t wealthai-frontend:latest ./frontend

# Tag for ECR
docker tag wealthai-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/wealthai-api:latest
docker tag wealthai-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/wealthai-frontend:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/wealthai-api:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/wealthai-frontend:latest

# Update ECS tasks
aws ecs update-service \
  --cluster wealthai-staging \
  --service wealthai-api-service \
  --force-new-deployment

# Check deployment status
aws ecs describe-services \
  --cluster wealthai-staging \
  --services wealthai-api-service
```

---

## 🚀 Production Deployment

### Infrastructure as Code (Terraform)

```hcl
# terraform/main.tf

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "wealthai" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "wealthai-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.wealthai.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.wealthai.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.wealthai.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}a"
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.wealthai.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = "${var.aws_region}b"
}

# RDS PostgreSQL (Production)
resource "aws_db_instance" "wealthai_postgres" {
  identifier     = "wealthai-postgres"
  engine         = "postgres"
  engine_version = "15.2"
  instance_class = "db.r5.xlarge"
  
  allocated_storage = 500
  storage_type      = "gp3"
  storage_encrypted = true
  
  username = var.db_username
  password = var.db_password
  
  db_name = "wealthai"
  
  # High availability
  multi_az = true
  
  # Backup
  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  
  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring.arn
  
  # Performance insights
  performance_insights_enabled = true
  
  skip_final_snapshot = false
  final_snapshot_identifier = "wealthai-final-snapshot"
  
  tags = {
    Name = "wealthai-postgres"
    Environment = "production"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "wealthai_redis" {
  replication_group_description = "WealthAI Redis Cluster"
  engine                        = "redis"
  engine_version                = "7.0"
  node_type                     = "cache.r6g.xlarge"
  port                          = 6379
  parameter_group_name          = "default.redis7"
  automatic_failover_enabled    = true
  num_cache_clusters            = 3
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token
  
  security_group_ids = [aws_security_group.redis.id]
  
  tags = {
    Name = "wealthai-redis"
    Environment = "production"
  }
}

# ALB
resource "aws_lb" "wealthai" {
  name               = "wealthai-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  
  enable_deletion_protection = true
  
  tags = {
    Name = "wealthai-alb"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "wealthai" {
  name = "wealthai-production"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Environment = "production"
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "ecs_asg" {
  name                = "wealthai-ecs-asg"
  vpc_zone_identifier = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  min_size            = 3
  max_size            = 10
  desired_capacity    = 5
  health_check_type   = "ELB"
  
  launch_template {
    id      = aws_launch_template.ecs_lt.id
    version = "$Latest"
  }
  
  tag {
    key                 = "Name"
    value               = "wealthai-ecs-instance"
    propagate_at_launch = true
  }
}
```

### Production Deployment Process

```bash
# 1. Create backup of current production
aws rds create-db-snapshot \
  --db-instance-identifier wealthai-postgres \
  --db-snapshot-identifier wealthai-pre-deployment-backup

# 2. Run database migrations in staging
AWS_PROFILE=staging npm run migrate:prod

# 3. Run smoke tests
AWS_PROFILE=staging npm run test:smoke

# 4. Build and push new images
docker build -t wealthai-api:v1.2.0 ./backend
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/wealthai-api:v1.2.0

# 5. Update production ECS service (rolling deployment)
aws ecs update-service \
  --cluster wealthai-production \
  --service wealthai-api-service \
  --force-new-deployment \
  --region us-east-1

# 6. Monitor deployment
watch -n 5 'aws ecs describe-services \
  --cluster wealthai-production \
  --services wealthai-api-service \
  --region us-east-1'

# 7. Health checks
curl https://api.wealthai.com/health
curl https://api.wealthai.com/api/v1/health

# 8. Smoke tests post-deployment
npm run test:smoke:prod

# 9. Notify team
aws sns publish \
  --topic-arn arn:aws:sns:us-east-1:123456789:wealthai-alerts \
  --message "Production deployment of v1.2.0 completed successfully"
```

---

## 📊 Monitoring & Alerts

### CloudWatch Dashboard

```python
# scripts/create_dashboard.py

import boto3

cloudwatch = boto3.client('cloudwatch')

dashboard_body = {
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/ApplicationELB", "TargetResponseTime", {"stat": "Average"}],
                    ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count"],
                    ["AWS/RDS", "CPUUtilization", {"stat": "Average"}],
                    ["AWS/RDS", "DatabaseConnections"],
                    ["AWS/ElastiCache", "CPUUtilization"],
                    ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
                    ["AWS/ECS", "MemoryUtilization", {"stat": "Average"}]
                ],
                "period": 60,
                "stat": "Average",
                "region": "us-east-1",
                "title": "WealthAI Production Metrics"
            }
        }
    ]
}

cloudwatch.put_dashboard(
    DashboardName='WealthAI-Production',
    DashboardBody=str(dashboard_body)
)
```

### Alerts

```python
# scripts/create_alarms.py

import boto3

cloudwatch = boto3.client('cloudwatch')

# High error rate alert
cloudwatch.put_metric_alarm(
    AlarmName='wealthai-high-error-rate',
    MetricName='HTTPCode_Target_5XX_Count',
    Namespace='AWS/ApplicationELB',
    Statistic='Sum',
    Period=60,
    EvaluationPeriods=2,
    Threshold=10,
    ComparisonOperator='GreaterThanThreshold',
    AlarmActions=['arn:aws:sns:us-east-1:123456789:wealthai-alerts']
)

# Database connection exhaustion
cloudwatch.put_metric_alarm(
    AlarmName='wealthai-db-connections-high',
    MetricName='DatabaseConnections',
    Namespace='AWS/RDS',
    Statistic='Average',
    Period=300,
    Threshold=80,
    ComparisonOperator='GreaterThanThreshold',
    AlarmActions=['arn:aws:sns:us-east-1:123456789:wealthai-critical']
)

# High CPU utilization
cloudwatch.put_metric_alarm(
    AlarmName='wealthai-ecs-high-cpu',
    MetricName='CPUUtilization',
    Namespace='AWS/ECS',
    Statistic='Average',
    Period=300,
    Threshold=80,
    ComparisonOperator='GreaterThanThreshold',
    AlarmActions=['arn:aws:sns:us-east-1:123456789:wealthai-alerts']
)
```

### Prometheus Config

```yaml
# monitoring/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'wealthai-api'
    static_configs:
      - targets: ['api.wealthai.com:9090']
  
  - job_name: 'wealthai-postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'wealthai-redis'
    static_configs:
      - targets: ['redis-exporter:9121']
  
  - job_name: 'wealthai-elasticsearch'
    static_configs:
      - targets: ['es-exporter:9114']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

---

## 💾 Backup & Recovery

### Automated Backups

```bash
# Enable automated RDS backups
aws rds modify-db-instance \
  --db-instance-identifier wealthai-postgres \
  --backup-retention-period 30 \
  --backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --apply-immediately

# Daily backup of S3 (receipts, documents)
aws s3 sync s3://wealthai-prod-documents \
  s3://wealthai-backups/documents/$(date +%Y-%m-%d)/ \
  --region us-east-1
```

### Disaster Recovery

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier wealthai-postgres-restored \
  --db-snapshot-identifier wealthai-pre-deployment-backup

# Restore from S3 backup
aws s3 sync s3://wealthai-backups/documents/2024-09-16/ \
  s3://wealthai-prod-documents \
  --region us-east-1

# RTO: 2 hours
# RPO: 1 hour
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

```yaml
# ECS Auto Scaling Policy
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: wealthai-api-hpa
spec:
  scaleTargetRef:
    apiVersion: v1
    kind: Service
    name: wealthai-api-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

```bash
# Add read replicas for analytics queries
aws rds create-db-instance-read-replica \
  --db-instance-identifier wealthai-postgres-replica-1 \
  --source-db-instance-identifier wealthai-postgres

# Upgrade RDS instance type if needed
aws rds modify-db-instance \
  --db-instance-identifier wealthai-postgres \
  --db-instance-class db.r5.2xlarge \
  --apply-immediately
```

---

## 🔧 Troubleshooting

### Common Issues

**1. High Latency**
```bash
# Check database slow queries
aws rds download-db-log-file-portion \
  --db-instance-identifier wealthai-postgres \
  --log-file-name error/postgresql.log

# Check CloudFront cache hit ratio
aws cloudfront get-distribution-statistics \
  --distribution-id E123456ABCDEF

# Optimize indexes
psql wealthai_prod -c "SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;"
```

**2. Out of Memory**
```bash
# Increase ElastiCache node size
aws elasticache modify-cache-cluster \
  --cache-cluster-id wealthai-redis \
  --cache-node-type cache.r6g.2xlarge

# Clear Redis cache
redis-cli -h wealthai-redis.xxxxx.ng.0001.use1.cache.amazonaws.com FLUSHALL
```

**3. Database Connection Exhaustion**
```bash
# Check active connections
psql wealthai_prod -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Kill idle connections
psql wealthai_prod -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE idle_in_transaction;"

# Increase connection pool
# Update pgbouncer configuration and restart
```

### Logs

```bash
# View API logs
aws logs tail /aws/ecs/wealthai-api-service --follow

# View RDS logs
aws rds describe-db-log-files --db-instance-identifier wealthai-postgres

# View CloudFront logs
aws s3 cp s3://wealthai-cloudfront-logs/ ./logs/ --recursive
```

---

## 📞 Support & Runbooks

### On-Call Procedures

1. **High Error Rate Alert**
   - Check `/health` endpoint
   - Review recent deployments
   - Check database connectivity
   - Escalate if critical

2. **Database Alert**
   - Check active connections
   - Review slow query log
   - Check disk space
   - Contact DBA

3. **Memory/CPU High**
   - Scale up instances
   - Review resource usage
   - Optimize slow queries
   - Monitor trend

### Rollback Procedure

```bash
# 1. Get previous image version
aws ecs describe-task-definition \
  --task-definition wealthai-api:2 \
  --query 'taskDefinition.image'

# 2. Update service to previous version
aws ecs update-service \
  --cluster wealthai-production \
  --service wealthai-api-service \
  --task-definition wealthai-api:2 \
  --force-new-deployment

# 3. Monitor rollback
watch -n 5 'aws ecs describe-services \
  --cluster wealthai-production \
  --services wealthai-api-service'
```


# AlphaDraft Database Schema & Entity Models

This document specifies the PostgreSQL relational schema and frontend TypeScript entity definitions following the decoupling from Firebase Firestore.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    USERS ||--o| USER_CREDITS : has
    USERS ||--o{ CREDIT_TRANSACTIONS : records
    USERS ||--o{ SUBSCRIPTIONS : subscribes
    PROJECTS ||--o{ INSTRUCTION_ANALYSES : contains
    PROJECTS ||--o{ EVALUATIONS : evaluated_by
    PROJECTS ||--o{ PROJECT_POSTS : has

    USERS {
        uuid id PK
        varchar email UK
        varchar full_name
        varchar password_hash
        jsonb roles
        boolean email_verified
        timestamp created_at
        timestamp updated_at
    }

    USER_CREDITS {
        uuid id PK
        uuid user_id FK
        integer available
        integer used
        integer monthly_allocation
        timestamp last_updated
    }

    CREDIT_TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        integer amount
        varchar transaction_type
        varchar feature
        timestamp created_at
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        varchar stripe_customer_id
        varchar stripe_subscription_id
        varchar status
        varchar plan_id
        timestamp current_period_end
        timestamp created_at
    }

    PROJECTS {
        uuid id PK
        uuid user_id FK
        varchar name
        text description
        text content
        varchar type
        varchar status
        integer stage
        float rating
        timestamp due_date
        timestamp created_at
        timestamp updated_at
    }

    INSTRUCTION_ANALYSES {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        text text_content
        varchar status
        jsonb analysis_results
        timestamp created_at
    }

    EVALUATIONS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        jsonb ai_detection_result
        jsonb plagiarism_result
        jsonb rubrics_evaluation
        timestamp created_at
    }

    PROJECT_POSTS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        text content
        varchar file_key
        timestamp created_at
    }
```

---

## 2. Table Specifications & Data Dictionaries

### 2.1 `users` Table
Stores authentication accounts, role arrays, and profile identification.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier. |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Account email address. |
| `full_name` | `VARCHAR(255)` | NOT NULL | User's full display name. |
| `password_hash` | `TEXT` | NOT NULL | Argon2 / bcrypt password hash. |
| `roles` | `JSONB` | NOT NULL, DEFAULT '["user"]' | Assigned security roles (`user`, `subscriber`, `admin`, `super_admin`). |
| `email_verified`| `BOOLEAN` | DEFAULT FALSE | Email verification status flag. |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Last record update timestamp. |

### 2.2 `projects` Table
Represents user writing workspaces, instructions, and document drafts.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | Project identifier. |
| `user_id` | `UUID` | FOREIGN KEY (`users.id`) ON DELETE CASCADE | Project owner. |
| `name` | `VARCHAR(255)` | NOT NULL | Document/project title. |
| `description` | `TEXT` | NULLABLE | Brief context or abstract. |
| `content` | `TEXT` | NOT NULL, DEFAULT '' | Raw or HTML/ProseMirror document body. |
| `type` | `VARCHAR(64)` | NOT NULL | Project category (e.g., Essay, Research Paper, Report). |
| `status` | `VARCHAR(32)` | NOT NULL, DEFAULT 'draft' | Status (`draft`, `in_progress`, `completed`, `archived`). |
| `stage` | `INTEGER` | NOT NULL, DEFAULT 0 | Wizard progression stage (0 to 4). |
| `rating` | `FLOAT` | DEFAULT 0.0 | Overall automated evaluation score. |
| `due_date` | `TIMESTAMPTZ` | NULLABLE | Submission deadline. |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Auto-updated timestamp. |

### 2.3 `user_credits` & `credit_transactions`
Handles account credit deductions and balance ledgers.
- **`user_credits`**: Tracks real-time credit capacity (`available`, `used`, `monthly_allocation`).
- **`credit_transactions`**: Audit trail of every credit movement (`DEDUCT`, `REFUND`, `TOP_UP`) tagged by feature (`AI_ONLY`, `ALIGNMENT_ONLY`, `PLAGIARISM_ONLY`).

### 2.4 `evaluations`
Stores evaluation results from AI detection and grading engines:
- **`ai_detection_result`** (`JSONB`): Winston.ai / Sapling score breakdown (`score`, `sentences`, `credits_used`).
- **`plagiarism_result`** (`JSONB`): Plagiarism percentage, source citations, matching URL indices.
- **`rubrics_evaluation`** (`JSONB`): Alignment scores against project instruction criteria.

```mermaid
erDiagram

    %% ============================
    %%   USERS
    %% ============================
    USERS {
        uuid id PK
        text email
        text password_hash
        text display_name
        text global_role
        timestamptz created_at
        timestamptz updated_at
    }

    %% ============================
    %%   ORG UNITS (Hierarchy)
    %% ============================
    ORG_UNITS {
        uuid id PK
        text name
        text kind
        uuid parent_unit_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    %% Self-reference: org unit hierarchy
    ORG_UNITS ||--o{ ORG_UNITS : "parent of"


    %% ============================
    %%   UNIT MEMBERSHIPS
    %% ============================
    UNIT_MEMBERSHIPS {
        uuid id PK
        uuid user_id FK
        uuid org_unit_id FK
        text position_level
        text position_function
        text position_title
        text scope_mode
        bool is_active
        timestamptz created_at
        timestamptz updated_at
    }

    USERS ||--o{ UNIT_MEMBERSHIPS : "has"
    ORG_UNITS ||--o{ UNIT_MEMBERSHIPS : "belongs to"


    %% ============================
    %%   MEMBERSHIP PERMISSIONS
    %% ============================
    MEMBERSHIP_PERMISSIONS {
        uuid id PK
        uuid membership_id FK
        text code
        text mode
        timestamptz created_at
    }

    UNIT_MEMBERSHIPS ||--o{ MEMBERSHIP_PERMISSIONS : "has overrides"

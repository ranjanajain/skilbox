# Skilling in a Box - Partner Content Hub

## Comprehensive Documentation & User Guide

**Version:** 1.0  
**Last Updated:** December 2025  
**Developed by:** Technofocus | Sponsored by Microsoft

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Test Credentials](#3-test-credentials)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Feature Documentation](#5-feature-documentation)
6. [User Workflows](#6-user-workflows)
7. [API Reference](#7-api-reference)
8. [Test Scenarios](#8-test-scenarios)

---

## 1. Overview

### 1.1 Purpose
Skilling in a Box is a partner skilling content hub that provides authorized Microsoft CSPs and Training Partners with controlled access to curated enablement assets for partner-led training delivery.

### 1.2 Key Objectives
- Deliver consistent, Microsoft-aligned training workshops
- Accelerate readiness across sales, presales, and technical audiences
- Scale skilling impact with quality and governance
- Track and measure training outcomes

### 1.3 Portal URL
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001/api

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS, Lucide Icons |
| Backend | FastAPI (Python), Pydantic |
| Database | MongoDB |
| Authentication | JWT (JSON Web Tokens) |
| File Storage | Azure Blob Storage |
| Process Manager | Supervisor |

### 2.2 Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React development server |
| Backend | 8001 | FastAPI application server |
| MongoDB | 27017 | Database server |

---

## 3. Test Credentials

### 3.1 Admin User
| Field | Value |
|-------|-------|
| **Email** | `admin@skillingbox.com` |
| **Password** | `admin123` |
| **Role** | Admin |
| **Status** | Approved |
| **Access** | Full system access |

### 3.2 Content Admin User
| Field | Value |
|-------|-------|
| **Email** | `content.admin@test.com` |
| **Password** | `ContentAdmin123` |
| **Role** | Content Admin |
| **Status** | Approved |
| **Access** | Course & content management |

### 3.3 Microsoft Stakeholder User
| Field | Value |
|-------|-------|
| **Email** | `ms.stakeholder@test.com` |
| **Password** | `MSStakeholder123` |
| **Role** | MS Stakeholder |
| **Status** | Approved |
| **Access** | Analytics, approvals, oversight |

### 3.4 Training Partner (Approved)
| Field | Value |
|-------|-------|
| **Email** | `partner.approved@test.com` |
| **Password** | `Partner123` |
| **Role** | Training Partner |
| **Status** | Approved |
| **Access** | Can download content, schedule executions |

### 3.5 Training Partner (Pending Approval)
| Field | Value |
|-------|-------|
| **Email** | `partner.pending@test.com` |
| **Password** | `Partner123` |
| **Role** | Training Partner |
| **Status** | Pending |
| **Access** | Can browse courses but cannot download |

---

## 4. User Roles & Permissions

### 4.1 Role Hierarchy

```
Admin (Highest)
    ├── Content Admin
    ├── MS Stakeholder
    └── Training Partner (Lowest)
```

### 4.2 Permission Matrix

| Feature | Admin | Content Admin | MS Stakeholder | Training Partner |
|---------|:-----:|:-------------:|:--------------:|:----------------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Browse Courses** | ✅ | ✅ | ✅ | ✅ |
| **Download Content** | ✅ | ✅ | ✅ | ✅ (if approved) |
| **Create Courses** | ✅ | ✅ | ❌ | ❌ |
| **Upload Files** | ✅ | ✅ | ❌ | ❌ |
| **Manage Courses** | ✅ | ✅ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ |
| **Approve Users** | ✅ | ❌ | ❌ | ❌ |
| **Change User Roles** | ✅ | ❌ | ❌ | ❌ |
| **View Analytics** | ✅ | ❌ | ✅ | ❌ |
| **View All Executions** | ✅ | ❌ | ✅ | ❌ |
| **Schedule Executions** | ❌ | ❌ | ❌ | ✅ |
| **Submit Attendance** | ❌ | ❌ | ❌ | ✅ |

### 4.3 Sidebar Menu by Role

#### Admin
- Dashboard
- Browse Courses
- Manage Courses
- Upload Content
- User Management
- Access Requests
- Analytics
- All Executions

#### Content Admin
- Dashboard
- Browse Courses
- Manage Courses
- Upload Content

#### MS Stakeholder
- Dashboard
- Browse Courses
- Analytics
- Access Requests
- All Executions

#### Training Partner
- Dashboard
- Browse Courses
- My Executions

---

## 5. Feature Documentation

### 5.1 Authentication

#### 5.1.1 Login
- Navigate to the portal URL
- Enter email and password
- Click "Sign In"
- First-time login requires accepting Terms of Use

#### 5.1.2 Request Access (New Users)
- Click "Request Access" tab
- Select role: "Partner" or "Microsoft"
- Fill in required details:
  - Email
  - Password
  - Full Name
  - Organization (for Partners)
  - Partner Type (CSP, ESI, MPL, GSI)
- Submit request
- Wait for admin approval

#### 5.1.3 Terms of Use
- Displayed on first login after approval
- Must scroll to bottom to enable checkbox
- Must accept to access the portal
- Covers content usage, IP rights, and reporting requirements

### 5.2 Course Management

#### 5.2.1 Course Metadata Fields
| Field | Description | Required |
|-------|-------------|:--------:|
| Title | Course name | ✅ |
| Description | Detailed description | ✅ |
| Category | GPS Solution Areas / Event-based | ✅ |
| Solution Area | ABS, Azure, Security | ✅ |
| Solution Play | Specific solution focus | ❌ |
| Course Type | Tech Deal Ready, Sales Ready, etc. | ✅ |
| Level | Beginner, Intermediate, Advanced | ✅ |
| Language | English, Chinese, German, etc. | ✅ |
| Target Role | Technical, Sales, Pre-Sales | ✅ |
| Target Audience | Description of audience | ✅ |
| Duration | e.g., "4.5 Hours" | ✅ |
| Certification Course | Yes/No | ❌ |
| Hands-on Lab | Yes/No | ❌ |
| Multilingual Audio | Yes/No | ❌ |

#### 5.2.2 File Types Supported
- Trainer Presentation (PPTX)
- Change Log (PDF)
- Train the Trainer Guide (PDF)
- Video Recording (MP4)
- Caption File (VTT/SRT)
- Lab Guide (Word/PDF)
- Lab Files (ZIP)

#### 5.2.3 Creating a Course (Admin/Content Admin)
1. Navigate to "Upload Content"
2. Select "Create New Course"
3. Fill in all required metadata fields
4. Upload relevant files
5. Click "Create Course & Upload Files"

#### 5.2.4 Adding Files to Existing Course
1. Navigate to "Upload Content"
2. Select "Add to Existing Course"
3. Select course from dropdown
4. Upload new files
5. Click "Upload Files"

### 5.3 Content Browsing & Download

#### 5.3.1 Browsing Courses
1. Navigate to "Browse Courses"
2. Use filters:
   - Search by keyword
   - Category
   - Solution Area
   - Level
   - Course Type
3. Click "View Details" on any course

#### 5.3.2 Course Details View
- Title and metadata badges
- **Last Updated** date (updates when content is modified)
- Duration, Language, Target Role, Target Audience
- Hands-on Lab and Certification indicators
- Description
- List of downloadable files

#### 5.3.3 Downloading Files
- **Approved Users:** Download button visible on each file
- **Pending Users:** Message shown that portal access is pending
- Downloads are logged for analytics

### 5.4 User Management (Admin Only)

#### 5.4.1 Viewing Users
1. Navigate to "User Management"
2. Filter by role using dropdown
3. View user details: Name, Email, Organization, Role, Status

#### 5.4.2 Approving Users
1. Find user with "Pending" status
2. Click "Approve" button
3. User gains portal access immediately

#### 5.4.3 Changing User Roles
1. Find user in list
2. Use role dropdown to select new role:
   - Training Partner
   - Content Admin
   - MS Stakeholder
   - Admin
3. Role changes immediately

### 5.5 Execution Management (Training Partners)

#### 5.5.1 Scheduling an Execution
1. Navigate to "My Executions"
2. Click "Schedule New Execution"
3. Select course (must have portal access)
4. Enter:
   - Execution Date
   - Location
   - Expected Attendees
   - Notes (optional)
5. Submit schedule

#### 5.5.2 Submitting Attendance
1. Navigate to "My Executions"
2. Find completed execution
3. Click "Submit Attendance"
4. Enter:
   - Actual Attendees
   - Completion Rate (%)
   - Feedback Summary
5. Submit data

### 5.6 Analytics (Admin/MS Stakeholder)

#### 5.6.1 Overview Dashboard
- Total Courses
- Total Training Partners
- Total Downloads
- Total Executions
- Total Trained Learners

#### 5.6.2 Download Analytics
- Downloads by date (chart)
- Top downloaded courses

#### 5.6.3 Learner Analytics
- Learners by organization
- Learners by course
- Completion rates

---

## 6. User Workflows

### 6.1 New Partner Onboarding Flow

```
1. Partner visits portal
        ↓
2. Clicks "Request Access"
        ↓
3. Fills registration form
   - Selects "Partner" role
   - Enters organization details
   - Selects Partner Type
        ↓
4. Submits request
        ↓
5. Receives confirmation message
        ↓
6. Admin reviews in User Management
        ↓
7. Admin approves user
        ↓
8. Partner logs in
        ↓
9. Accepts Terms of Use
        ↓
10. Accesses portal with full download rights
```

### 6.2 Content Upload Flow

```
1. Content Admin logs in
        ↓
2. Navigates to "Upload Content"
        ↓
3. Selects "Create New Course"
        ↓
4. Fills metadata form
   - Title, Description
   - Solution Area, Course Type
   - Level, Language
   - Target Audience
        ↓
5. Uploads files
   - PPTX, PDF, MP4, etc.
        ↓
6. Submits form
        ↓
7. Course appears in library
   - Last Updated = Current date
```

### 6.3 Training Delivery Flow

```
1. Partner browses courses
        ↓
2. Downloads training materials
        ↓
3. Schedules execution
   - Date, Location
   - Expected attendees
        ↓
4. Delivers training
        ↓
5. Submits attendance data
   - Actual attendees
   - Completion rate
        ↓
6. Data appears in Analytics
```

---

## 7. API Reference

### 7.1 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### 7.2 Course Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses (with filters) |
| GET | `/api/courses/{id}` | Get course details |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |

### 7.3 File Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/courses/{id}/files` | Upload file |
| GET | `/api/courses/{id}/files/{file_id}/download` | Download file |
| DELETE | `/api/courses/{id}/files/{file_id}` | Delete file |

### 7.4 User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| PUT | `/api/users/{id}/approve` | Approve user |
| PUT | `/api/users/{id}/role?role={role}` | Change role |

### 7.5 Execution Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/executions` | List executions |
| POST | `/api/executions` | Schedule execution |
| POST | `/api/executions/{id}/attendance` | Submit attendance |

### 7.6 Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Overview stats |
| GET | `/api/analytics/downloads` | Download analytics |
| GET | `/api/analytics/learners` | Learner analytics |

### 7.7 Metadata Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metadata` | Get all dropdown options |

---

## 8. Test Scenarios

### 8.1 Authentication Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-01 | Valid login | Enter valid credentials, click Sign In | User logged in, redirected to dashboard |
| AUTH-02 | Invalid login | Enter wrong password | "Invalid credentials" error shown |
| AUTH-03 | Terms acceptance | Login first time, scroll terms, accept | Access granted to portal |
| AUTH-04 | Terms decline | Login, click Decline on terms | Returned to login page |
| AUTH-05 | Request access | Fill registration form, submit | Success message, pending approval |

### 8.2 Course Management Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CRS-01 | Create course | Fill all fields, upload files, submit | Course created, appears in library |
| CRS-02 | Browse courses | Navigate to Browse Courses | Course list displayed with filters |
| CRS-03 | Filter courses | Select Solution Area filter | Only matching courses shown |
| CRS-04 | Search courses | Enter search term | Matching courses displayed |
| CRS-05 | View course details | Click View Details | Modal shows all course info + Last Updated |
| CRS-06 | Add files to course | Select existing course, upload files | Files added, Last Updated changes |

### 8.3 Download Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| DL-01 | Download as approved partner | Click Download on file | File downloads successfully |
| DL-02 | Download as pending partner | View course details | "Portal access pending" message shown |
| DL-03 | Download as admin | Click Download on any file | File downloads successfully |

### 8.4 User Management Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| USR-01 | View all users | Navigate to User Management | All users listed |
| USR-02 | Filter by role | Select role from dropdown | Only matching users shown |
| USR-03 | Approve user | Click Approve on pending user | Status changes to Approved |
| USR-04 | Change role | Select new role from dropdown | Role updated immediately |

### 8.5 Execution Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EXE-01 | Schedule execution | Fill form, submit | Execution created |
| EXE-02 | View my executions | Navigate to My Executions | List of user's executions |
| EXE-03 | Submit attendance | Fill attendance form, submit | Data saved, status = completed |

### 8.6 Analytics Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ANA-01 | View overview | Navigate to Analytics | Stats cards displayed |
| ANA-02 | View download trends | Check download section | Chart and top courses shown |
| ANA-03 | View learner data | Check learner section | Data by org and course shown |

### 8.7 Access Control Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AC-01 | Partner access to admin features | Try to access User Management | Feature not in sidebar |
| AC-02 | Content admin access to analytics | Try to access Analytics | Feature not in sidebar |
| AC-03 | MS Stakeholder access to upload | Try to access Upload Content | Feature not in sidebar |

---

## Appendix A: Solution Areas

- AI Business Solutions (ABS)
- Azure - Cloud & AI Platform
- Security

## Appendix B: Course Types

- Tech Deal Ready
- Sales Ready
- Project Ready
- Project Ready with Labs
- Credential Ready

## Appendix C: Partner Types

- CSP (Cloud Solution Provider)
- ESI (Enterprise Skills Initiative)
- MPL (Microsoft Partner Learning)
- GSI (Global System Integrator)

## Appendix D: Supported Languages

- English (US)
- 中文 (简体字) - Chinese Simplified
- Deutsch - German
- Español - Spanish
- Français - French
- Italiano - Italian
- 日本語 - Japanese
- 한국어 - Korean
- Português - Portuguese
- 中文 (繁體字) - Chinese Traditional

---

## Support

For technical issues or questions, contact the development team.

**Document Version:** 1.0  
**Created:** December 2025  
**Author:** Development Team

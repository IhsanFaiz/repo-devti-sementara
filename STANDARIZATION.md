# Standarisasi Template Satu - Next.js

> **Dokumentasi Standarisasi Coding & Development Workflow**  
> Template Next.js untuk Aplikasi SATU - Telkom University  
> Version: 1.0.0

---

## 📋 Daftar Isi

1. [Tech Stack & Dependencies](#-tech-stack--dependencies)
2. [Struktur Proyek](#-struktur-proyek)
3. [Konfigurasi Proyek](#-konfigurasi-proyek)
4. [Standar Coding](#-standar-coding)
5. [Arsitektur & Pattern](#-arsitektur--pattern)
6. [API Integration](#-api-integration)
7. [State Management](#-state-management)
8. [Styling Guidelines](#-styling-guidelines)
9. [Component Development](#-component-development)
10. [Routing & Navigation](#-routing--navigation)
11. [Authentication & Authorization](#-authentication--authorization)
12. [Testing](#-testing)
13. [Environment Variables](#-environment-variables)
14. [Build & Deployment](#-build--deployment)
15. [Best Practices](#-best-practices)

---

## 🛠 Tech Stack & Dependencies

### Core Technologies

```json
{
  "framework": "Next.js 14.2.17 (App Router)",
  "runtime": "Node.js 20.9+",
  "language": "TypeScript 5.5.4",
  "ui-library": "Material-UI (MUI) 5.15.1",
  "styling": "Tailwind CSS 3.4.13",
  "package-manager": "npm (primary)"
}
```

### Key Dependencies

#### UI & Styling

- **@mui/material** - Material Design component library
- **@mui/lab** - Experimental MUI components
- **@emotion/react** & **@emotion/styled** - CSS-in-JS untuk MUI
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **iconsax-react** - Icon library

#### Data Fetching & State

- **@tanstack/react-query** - Server state management
- **SWR** - Data fetching library
- **Axios** - HTTP client

#### Forms & Validation

- **Formik** - Form management
- **Yup** - Schema validation

#### Utilities

- **Lodash** - Utility functions
- **react-intl** - Internationalization (i18n)
- **next-auth** - Authentication

#### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Playwright** - E2E testing

---

## 📁 Struktur Proyek

```
satu-next-template/
├── public/                      # Static assets
├── src/
│   ├── api/                    # API route handlers
│   │   ├── menu.ts            # Menu API actions
│   │   └── snackbar.ts        # Snackbar API actions
│   │
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth route group
│   │   ├── (blank)/           # Blank layout route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── loading.tsx        # Global loading
│   │   ├── error.tsx          # Global error
│   │   ├── not-found.tsx      # 404 page
│   │   ├── globals.css        # Global styles
│   │   └── ProviderWrapper.tsx # Provider wrapper
│   │
│   ├── components/             # Reusable components
│   │   ├── @extended/         # Extended/enhanced components
│   │   ├── customization/     # Customization components
│   │   ├── logo/              # Logo components
│   │   ├── table/             # Table components
│   │   ├── third-party/       # Third-party integrations
│   │   ├── Loader.tsx
│   │   ├── MainCard.tsx
│   │   └── ...
│   │
│   ├── contexts/               # React contexts
│   │
│   ├── hooks/                  # Custom React hooks
│   │
│   ├── layout/                 # Layout components
│   │   └── DashboardLayout/   # Dashboard layout structure
│   │
│   ├── menu-items/             # Navigation menu definitions
│   │
│   ├── sections/               # Page-specific sections
│   │
│   ├── server/                 # Server-side utilities
│   │
│   ├── themes/                 # MUI theme configuration
│   │   ├── overrides/         # Component style overrides
│   │   ├── theme.ts
│   │   └── ...
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── config.ts
│   │   ├── menu.ts
│   │   ├── table.ts
│   │   └── ...
│   │
│   ├── utils/                  # Utility functions
│   │   ├── axios.ts           # Axios configuration
│   │   ├── endpoints.ts       # API endpoints definitions
│   │   ├── data.ts            # Data fetching functions
│   │   ├── client-actions.ts  # Client-side actions
│   │   ├── locales/           # Internationalization
│   │   └── ...
│   │
│   ├── views/                  # Page view components
│   │
│   └── config.ts               # App configuration
│
├── tests/                       # Playwright tests
├── .prettierrc                 # Prettier config
├── .env.local                  # Environment variables
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
├── playwright.config.ts        # Playwright config
└── package.json                # Dependencies
```

### Penjelasan Struktur Folder

#### `src/app/` - Next.js App Router

- Menggunakan **App Router** (Next.js 14)
- Route groups dengan `()` untuk organize layout tanpa mempengaruhi URL
- File conventions: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`

#### `src/components/` - Komponen Reusable

- Komponen UI yang dapat digunakan di berbagai halaman
- Sudah terbagi berdasarkan kategori (`@extended`, `table`, dll)

#### `src/utils/` - Utility Functions

- **axios.ts**: Konfigurasi HTTP client
- **endpoints.ts**: Definisi API endpoints
- **data.ts**: Fungsi data fetching
- **locales/**: File terjemahan untuk multi-language

#### `src/themes/` - Theme Configuration

- Konfigurasi tema Material-UI
- Overrides untuk customize komponen MUI

#### `src/types/` - Type Definitions

- Semua TypeScript interfaces dan types

---

## ⚙️ Konfigurasi Proyek

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": "src", // Import path alias
    "strict": true, // Strict mode enabled
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve"
  }
}
```

**WAJIB:**

- ✅ Gunakan `baseUrl: "src"` untuk import tanpa relative path
- ✅ Enable strict mode untuk type safety
- ✅ Gunakan TypeScript untuk semua file baru

**Contoh Import:**

```typescript
// ✅ Benar - menggunakan baseUrl
import { config } from 'config';
import MainCard from 'components/MainCard';

// ❌ Salah - relative path
import { config } from '../../../config';
```

### Next.js Configuration (`next.config.js`)

```javascript
{
  output: 'standalone',                    // Production build
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    }
  }
}
```

**Fitur Penting:**

- Modular imports untuk tree-shaking MUI
- Support untuk staging & production environments
- Standalone output untuk Docker deployment

### Prettier Configuration

```json
{
  "printWidth": 140,
  "singleQuote": true,
  "trailingComma": "none",
  "tabWidth": 2,
  "useTabs": false
}
```

**WAJIB:**

- ✅ Jalankan `npm run prettier` sebelum commit
- ✅ Gunakan single quotes
- ✅ Max line width: 140 karakter
- ✅ Tab width: 2 spaces

---

## 📝 Standar Coding

### Naming Conventions

#### 1. File Naming

```
✅ BENAR:
- components/MainCard.tsx          (PascalCase untuk components)
- utils/axios.ts                   (camelCase untuk utilities)
- types/config.ts                  (camelCase untuk types)
- hooks/useAuth.ts                 (camelCase, prefix 'use')
- app/(dashboard)/page.tsx         (lowercase untuk routes)

❌ SALAH:
- components/mainCard.tsx
- components/main_card.tsx
- utils/Axios.ts
```

#### 2. Variable & Function Naming

```typescript
// ✅ BENAR
const userName = 'John';
const API_BASE_URL = 'https://api.example.com';
const handleSubmit = () => {};
const getUserData = async () => {};

interface UserProfile {
  firstName: string;
  lastName: string;
}

type NavigationItem = {
  id: string;
  title: string;
};

// ❌ SALAH
const user_name = 'John';
const apibaseurl = 'https://api.example.com';
const HandleSubmit = () => {};
```

**Rules:**

- **camelCase**: variables, functions, parameters
- **PascalCase**: components, interfaces, types, classes
- **UPPER_SNAKE_CASE**: constants
- **Prefix 'use'**: custom hooks
- **Prefix 'handle'**: event handlers

#### 3. Component Naming

```typescript
// ✅ BENAR - Component file dan export sesuai
// File: src/components/UserCard.tsx
export default function UserCard() {
  return <div>User Card</div>;
}

// ✅ BENAR - Named export untuk utility components
// File: src/components/@extended/IconButton.tsx
export function IconButton() {
  return <button>Icon</button>;
}

// ❌ SALAH - Nama tidak konsisten
// File: UserCard.tsx
export default function usercard() {} // nama komponen salah
```

### Code Style Guidelines

#### 1. Import Organization

```typescript
// ✅ BENAR - Urutan import yang terorganisir
// 1. External dependencies
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';

// 2. Internal absolute imports (menggunakan baseUrl)
import MainCard from 'components/MainCard';
import { getUsers } from 'utils/data';
import { UserType } from 'types/user';

// 3. Relative imports (jika ada)
import './styles.css';

// ❌ SALAH - Import tidak terorganisir
import { UserType } from 'types/user';
import axios from 'axios';
import MainCard from 'components/MainCard';
import { useState } from 'react';
```

#### 2. Type Definitions

```typescript
// ✅ BENAR - Definisikan types di folder types/
// File: src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

// ✅ BENAR - Gunakan explicit types
function getUserById(id: string): Promise<User> {
  return axios.get(`/users/${id}`);
}

// ❌ SALAH - Menggunakan 'any'
function getUserById(id: any): any {
  return axios.get(`/users/${id}`);
}

// ✅ BENAR - Props dengan interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

#### 3. Component Structure

```typescript
// ✅ BENAR - Struktur component yang terorganisir
'use client'; // Jika client component

// 1. Imports
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

// 2. Type definitions (jika lokal ke component)
interface UserCardProps {
  name: string;
  email: string;
}

// 3. Component
export default function UserCard({ name, email }: UserCardProps) {
  // 3.1. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 3.2. Helper functions
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // 3.3. Render
  return (
    <MainCard>
      <Typography variant="h5">{name}</Typography>
      <Typography variant="body2">{email}</Typography>
    </MainCard>
  );
}
```

#### 4. Async/Await Usage

```typescript
// ✅ BENAR - Gunakan async/await dengan error handling
async function fetchUserData(userId: string) {
  try {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// ✅ BENAR - Multiple async calls
async function fetchDashboardData() {
  try {
    const [users, stats, notifications] = await Promise.all([getUsers(), getStats(), getNotifications()]);

    return { users, stats, notifications };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ❌ SALAH - Menggunakan .then()
function fetchUserData(userId: string) {
  return axios
    .get(`/users/${userId}`)
    .then((response) => response.data)
    .catch((error) => console.error(error));
}
```

---

## 🏗 Arsitektur & Pattern

### 1. Next.js App Router Pattern

Template ini menggunakan **App Router** (Next.js 14), bukan Pages Router.

#### File Conventions

```
app/
├── layout.tsx          # Root layout (WAJIB)
├── page.tsx            # Home page
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── not-found.tsx       # 404 page
├── (dashboard)/        # Route group (tidak mempengaruhi URL)
│   ├── layout.tsx      # Dashboard layout
│   └── page.tsx        # /dashboard
└── api/                # API routes
    └── users/
        └── route.ts    # /api/users
```

#### Layout Pattern

```typescript
// ✅ BENAR - Root Layout (src/app/layout.tsx)
import type { Metadata } from 'next';
import ProviderWrapper from './ProviderWrapper';
import './globals.css';

export const metadata: Metadata = {
  title: 'Satu Template | Telkom University',
  description: 'Satu Template | Telkom University'
};

export default function RootLayout({ children }: { children: React.ReactElement }) {
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
```

#### Server vs Client Components

```typescript
// ✅ Server Component (default)
// File: app/dashboard/page.tsx
import { getUsers } from 'utils/data';

export default async function DashboardPage() {
  const users = await getUsers(); // Fetch di server

  return <div>{users.map(user => <UserCard key={user.id} {...user} />)}</div>;
}

// ✅ Client Component (dengan 'use client')
// File: components/InteractiveButton.tsx
'use client';

import { useState } from 'react';

export default function InteractiveButton() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**Rules:**

- ✅ Default: Server Component (lebih cepat, SEO-friendly)
- ✅ Gunakan `'use client'` hanya jika perlu:
  - Menggunakan useState, useEffect, atau hooks lain
  - Event handlers (onClick, onChange, dll)
  - Browser APIs (localStorage, window, dll)
- ✅ Server components bisa import client components, tapi tidak sebaliknya

### 2. Component Architecture

#### Component Hierarchy

```
Page Component (Server/Client)
  └─ Layout Component
      └─ Section Component
          └─ UI Component
              └─ Base Component
```

**Contoh:**

```typescript
// Page: app/(dashboard)/users/page.tsx
export default function UsersPage() {
  return <UsersSection />;
}

// Section: sections/users/UsersSection.tsx
export default function UsersSection() {
  return (
    <MainCard title="Users">
      <UsersTable />
    </MainCard>
  );
}

// Component: components/table/UsersTable.tsx
export default function UsersTable() {
  return (
    <TableContainer>
      {/* table content */}
    </TableContainer>
  );
}
```

### 3. Data Flow Pattern

```
API Endpoint (Backend)
      ↓
Axios Instance (src/utils/axios.ts)
      ↓
Data Fetching Function (src/utils/data.ts)
      ↓
React Query / SWR (Client Component)
      ↓
Component
```

---

## 🌐 API Integration

### 1. Axios Configuration

**File: `src/utils/axios.ts`**

```typescript
import axios from 'axios';
import { getSession } from 'next-auth/react';

// Axios instance dengan base URL dari env
const axiosServices = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEXT_APP_API_URL
});

// Request interceptor - menambahkan token
axiosServices.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.token?.accessToken) {
    config.headers['Authorization'] = `Bearer ${session.token.accessToken}`;
  }
  return config;
});

// Response interceptor - handle 401 Unauthorized
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.location.href = '/logout';
    }
    return Promise.reject(error);
  }
);

export default axiosServices;
```

**WAJIB:**

- ✅ Semua API calls HARUS menggunakan `axiosServices` dari file ini
- ✅ JANGAN membuat axios instance baru di komponen
- ✅ Token handling otomatis via interceptors

### 2. API Endpoints Definition

**File: `src/utils/endpoints.ts`**

```typescript
// ✅ BENAR - Centralized endpoints
const endpoints = {
  // Auth
  login: 'issueauth',
  profile: 'issueprofile',

  // Users
  users_all: 'all',
  users_pagination: 'pagination',
  users_create: 'create',
  users_update: 'update',
  users_delete: 'delete',

  // Students (contoh penambahan)
  students_list: 'students',
  students_detail: 'students/:id'
};

export default endpoints;
```

**Rules:**

- ✅ Gunakan naming convention: `resource_action`
- ✅ SEMUA endpoints HARUS didefinisikan di sini
- ✅ Gunakan dynamic segments dengan `:param`

### 3. Data Fetching Functions

**File: `src/utils/data.ts`**

```typescript
import endpoints from 'utils/endpoints';
import axios from 'utils/axios';

// ✅ BENAR - Fungsi fetch dengan types
export async function getUsers(): Promise<User[]> {
  try {
    const { data } = await axios.get(endpoints.users_all);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ✅ BENAR - Fungsi dengan parameters
export async function getUsersPagination(page: string | null, limit: string | null, query: string | null) {
  const params = {
    page: page || 1,
    limit: limit || 10,
    search: query || ''
  };

  try {
    const { data } = await axios.get(endpoints.users_pagination, { params });
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ✅ BENAR - POST request
export async function createUser(userData: CreateUserInput) {
  try {
    const { data } = await axios.post(endpoints.users_create, userData);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ✅ BENAR - Dynamic route
export async function getUserById(id: string) {
  try {
    const endpoint = endpoints.users_detail.replace(':id', id);
    const { data } = await axios.get(endpoint);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**WAJIB:**

- ✅ SEMUA data fetching HARUS di `utils/data.ts`
- ✅ JANGAN fetch langsung di component
- ✅ Gunakan try-catch untuk error handling
- ✅ Definisikan return types

### 4. Usage in Components

#### Dengan React Query (Recommended)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsers } from 'utils/data';

export default function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(user => (
        <UserCard key={user.id} {...user} />
      ))}
    </div>
  );
}
```

#### Dengan SWR

```typescript
'use client';

import useSWR from 'swr';
import { getUsers } from 'utils/data';

export default function UsersPage() {
  const { data, error, isLoading } = useSWR('/users', getUsers);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div>
      {data?.map(user => (
        <UserCard key={user.id} {...user} />
      ))}
    </div>
  );
}
```

---

## 🎨 State Management

Template ini menggunakan beberapa solusi state management:

### 1. React Query (@tanstack/react-query)

**Untuk: Server state, data fetching, caching**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser } from 'utils/data';

export default function UsersManagement() {
  const queryClient = useQueryClient();

  // Query untuk fetch data
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // 5 menit
  });

  // Mutation untuk create/update/delete
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate & refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleCreate = (userData: CreateUserInput) => {
    createMutation.mutate(userData);
  };

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### 2. React Context

**Untuk: Global UI state (theme, auth, etc)**

```typescript
// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### 3. Local State (useState)

**Untuk: Component-level state**

```typescript
'use client';

import { useState } from 'react';

export default function SearchInput() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Rules:**

- ✅ React Query/SWR: Server data, API calls
- ✅ Context: Global UI state (theme, auth, menu)
- ✅ useState: Local component state
- ❌ JANGAN gunakan Redux (sudah tidak diperlukan)

---

## 🎨 Styling Guidelines

Template ini menggunakan **Material-UI (MUI)** + **Tailwind CSS**.

### 1. Kapan Menggunakan MUI vs Tailwind

```typescript
// ✅ BENAR - Gunakan MUI untuk komponen kompleks
import { Button, TextField, Card, Dialog } from '@mui/material';

<Button variant="contained" color="primary">
  Submit
</Button>

// ✅ BENAR - Gunakan Tailwind untuk spacing, layout
<div className="flex gap-4 p-6">
  <MainCard className="flex-1">Content</MainCard>
</div>

// ✅ BENAR - Kombinasi MUI + Tailwind
<Box className="flex justify-between items-center mb-4">
  <Typography variant="h5">Users</Typography>
  <Button variant="contained">Add User</Button>
</Box>
```

**Rules:**

- ✅ **MUI**: Komponen UI (Button, TextField, Dialog, Card, Table)
- ✅ **Tailwind**: Layout, spacing, utilities (flex, grid, margin, padding)
- ✅ Kombinasi keduanya diperbolehkan

### 2. MUI Theme Customization

**File: `src/themes/theme.ts`**

```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif'
  }
});

export default theme;
```

**Component Overrides:** `src/themes/overrides/`

```typescript
// src/themes/overrides/Button.tsx
export default function Button(theme: Theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none'
        }
      }
    }
  };
}
```

### 3. Tailwind Usage

```typescript
// ✅ BENAR - Layout dengan Tailwind
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <MainCard>Card 1</MainCard>
    <MainCard>Card 2</MainCard>
    <MainCard>Card 3</MainCard>
  </div>
</div>

// ✅ BENAR - Responsive design
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>

// ✅ BENAR - Custom animations (dari tailwind.config.js)
<div className="animate-move">Animated</div>
```

### 4. Styling Best Practices

```typescript
// ✅ BENAR - Gunakan sx prop untuk dynamic styles
<Box
  sx={{
    backgroundColor: isActive ? 'primary.main' : 'grey.300',
    padding: 2,
    borderRadius: 1
  }}
>
  Content
</Box>

// ✅ BENAR - Gunakan tailwind-merge untuk conditional classes
import { twMerge } from 'tailwind-merge';

<div className={twMerge(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-500 text-white',
  !isActive && 'bg-gray-200'
)}>
  Content
</div>

// ❌ SALAH - Inline styles
<div style={{ padding: '16px', backgroundColor: '#fff' }}>
  Content
</div>
```

---

## 🧩 Component Development

### 1. Component Template

```typescript
'use client'; // Jika client component

// Imports
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

// Types
interface ComponentNameProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

// Component
export default function ComponentName({
  title,
  description,
  onAction
}: ComponentNameProps) {
  // State
  const [isActive, setIsActive] = useState(false);

  // Handlers
  const handleClick = () => {
    setIsActive(!isActive);
    onAction?.();
  };

  // Render
  return (
    <MainCard>
      <Box className="flex justify-between items-center">
        <div>
          <Typography variant="h5">{title}</Typography>
          {description && (
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          )}
        </div>
        <button onClick={handleClick}>Toggle</button>
      </Box>
    </MainCard>
  );
}
```

### 2. Reusable Components di `src/components/`

#### MainCard Component

```typescript
// ✅ Gunakan MainCard sebagai container standar
import MainCard from 'components/MainCard';

<MainCard
  title="Card Title"
  secondary={<Button>Action</Button>}
>
  <Typography>Card content</Typography>
</MainCard>
```

#### Loader Component

```typescript
// ✅ Gunakan Loader untuk loading states
import Loader from 'components/Loader';

{isLoading && <Loader />}
```

### 3. Custom Hooks

**File: `src/hooks/useAuth.ts`** (contoh)

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading'
  };
}

// Usage
function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome {user?.name}</div>;
}
```

---

## 🧭 Routing & Navigation

### 1. Route Groups

Template menggunakan route groups untuk organize layout:

```
app/
├── (auth)/              # Auth pages (login, register)
│   ├── layout.tsx       # Auth layout (simple, no sidebar)
│   └── login/
│       └── page.tsx     # /login
│
├── (dashboard)/         # Dashboard pages
│   ├── layout.tsx       # Dashboard layout (dengan sidebar)
│   ├── page.tsx         # /dashboard
│   └── users/
│       └── page.tsx     # /dashboard/users
│
└── (blank)/             # Blank pages (404, error)
    └── layout.tsx       # Minimal layout
```

**Route groups `()` tidak mempengaruhi URL path.**

### 2. Navigation

#### Link Component

```typescript
import Link from 'next/link';

// ✅ BENAR - Internal links
<Link href="/dashboard">Dashboard</Link>

// ✅ BENAR - Dynamic routes
<Link href={`/users/${user.id}`}>
  View Profile
</Link>

// ✅ BENAR - External links
<Link href="https://example.com" target="_blank" rel="noopener">
  External Link
</Link>
```

#### Programmatic Navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = async () => {
    // Login logic
    router.push('/dashboard');
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### 3. Menu Configuration

**File: `src/menu-items/`**

```typescript
// menu-items/dashboard.ts
import { NavItemType } from 'types/menu';

const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard-default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardIcon,
      breadcrumbs: false
    },
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/dashboard/users',
      icon: icons.UsersIcon
    }
  ]
};

export default dashboard;
```

---

## 🔐 Authentication & Authorization

### 1. Next Auth Configuration

**File: `src/server/auth.ts`**

Template menggunakan **NextAuth v5** untuk authentication.

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Call your API
        const user = await loginAPI(credentials);
        if (user) return user;
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.token = token;
      return session;
    }
  }
});
```

### 2. Protected Routes

```typescript
// ✅ Server Component - menggunakan auth()
import { auth } from 'server/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <div>Protected Content</div>;
}

// ✅ Client Component - menggunakan useSession()
'use client';

import { useSession } from 'next-auth/react';

export default function ProtectedPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <Loader />;
  if (!session) return <div>Access Denied</div>;

  return <div>Protected Content</div>;
}
```

### 3. Role-Based Access Control

**File: `src/config.ts`**

```typescript
export const roleAccess = {
  GS: ['*'], // Global Admin - all access
  TW: ['*'],
  FD: ['*'],
  BD: ['*'],
  SA: ['*']
  // BD: ['/dashboard', '/api', '/scope'], // Custom access
};

// Usage
function checkAccess(userRole: string, path: string): boolean {
  const allowedPaths = roleAccess[userRole] || [];
  return allowedPaths.includes('*') || allowedPaths.includes(path);
}
```

---

## 🧪 Testing

### 1. Playwright Configuration

Template menggunakan **Playwright** untuk E2E testing.

**File: `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ]
});
```

### 2. Writing Tests

**File: `tests/example.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Satu Template/);
});

test('login flow', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

### 3. Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npm run test

# Run tests in UI mode
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed
```

---

## 🔧 Environment Variables

### 1. Environment Files

```
.env.local           # Local development (gitignored)
.env.example         # Example env file (committed to git)
```

### 2. Environment Variables Structure

**File: `.env.local`**

```bash
# API Configuration
NEXT_PUBLIC_NEXT_APP_API_URL=https://api.example.com
NEXT_APP_API_URL_LOGIN=https://login.example.com

# Environment
NEXT_PUBLIC_ENV=development  # development | staging | production

# Base Path (untuk deployment di subfolder)
NEXT_PUBLIC_BASE_PATH=/app

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
```

**WAJIB:**

- ✅ Variables yang digunakan di client HARUS prefix `NEXT_PUBLIC_`
- ✅ Simpan sensitive data di `.env.local` (JANGAN commit)
- ✅ Update `.env.example` sebagai template
- ❌ JANGAN hardcode API URLs di code

### 3. Usage in Code

```typescript
// ✅ BENAR - Menggunakan env variables
const apiUrl = process.env.NEXT_PUBLIC_NEXT_APP_API_URL;

// Client-side
if (typeof window !== 'undefined') {
  console.log('API URL:', process.env.NEXT_PUBLIC_NEXT_APP_API_URL);
}

// Server-side (bisa akses semua env vars)
const secret = process.env.NEXTAUTH_SECRET;
```

---

## 🚀 Build & Deployment

### 1. Development

```bash
# Start dev server di port 3001
npm run dev

# With turbopack (faster)
npm run dev

# Akses aplikasi
http://localhost:3001
```

### 2. Production Build

```bash
# Build aplikasi
npm run build

# Test production build locally
npm run start

# Akses aplikasi
http://localhost:3001
```

### 3. Deployment Checklist

#### Before Deployment

- [ ] Update `.env.local` dengan production values
- [ ] Set `NEXT_PUBLIC_ENV=production`
- [ ] Set `NEXT_PUBLIC_BASE_PATH` jika deploy di subfolder
- [ ] Test build locally: `npm run build && npm run start`
- [ ] Run linting: `npm run lint`
- [ ] Run type checking: `npx tsc --noEmit`
- [ ] Update version di `package.json`

#### Environment-Specific Config

```javascript
// next.config.js
const isProdOrStaging = process.env.NEXT_PUBLIC_ENV === 'production' || process.env.NEXT_PUBLIC_ENV === 'staging';

const nextConfig = {
  output: isProdOrStaging ? 'standalone' : undefined,
  basePath: isProdOrStaging ? process.env.NEXT_PUBLIC_BASE_PATH : undefined
};
```

### 4. Docker Deployment (Optional)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
```

```bash
# Build image
docker build -t satu-next-app .

# Run container
docker run -p 3001:3001 satu-next-app
```

---

## ✅ Best Practices

### 1. Code Organization

```
✅ DO:
- Pisahkan logic dan UI
- Gunakan custom hooks untuk reusable logic
- Component kecil dan fokus, single responsibility
- Centralized configuration (config.ts, endpoints.ts)

❌ DON'T:
- Component besar dengan banyak tanggung jawab
- Copy-paste code
- Hardcode values
- Logic di dalam JSX
```

### 2. Performance

```typescript
// ✅ BENAR - Lazy loading
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('components/HeavyComponent'), {
  loading: () => <Loader />
});

// ✅ BENAR - Memoization
import { memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* expensive render */}</div>;
});

// ✅ BENAR - Image optimization
import Image from 'next/image';

<Image
  src="/images/photo.jpg"
  alt="Photo"
  width={500}
  height={300}
  priority // untuk above-the-fold images
/>
```

### 3. Error Handling

```typescript
// ✅ BENAR - Comprehensive error handling
async function fetchData() {
  try {
    const data = await getUsers();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching users:', error);

    // Log ke monitoring service (Sentry, etc)
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      // logToSentry(error);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ✅ BENAR - Error boundaries
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 4. Security

```typescript
// ✅ BENAR - Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);

// ✅ BENAR - CSRF protection (NextAuth handles this)
// ✅ BENAR - XSS protection (React escapes by default)

// ❌ SALAH - Dangerous HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ BENAR - Validate & sanitize
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 5. Accessibility

```typescript
// ✅ BENAR - Semantic HTML
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ✅ BENAR - ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <CloseIcon />
</button>

// ✅ BENAR - Alt text untuk images
<Image src="/photo.jpg" alt="User profile photo" />

// ✅ BENAR - Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### 6. Git Workflow

```bash
# Branch naming
feature/add-user-management
bugfix/fix-login-error
hotfix/critical-security-patch

# Commit messages
feat: add user management page
fix: resolve login authentication error
docs: update API documentation
refactor: improve data fetching logic
style: format code with prettier
test: add playwright tests for login flow

# Before commit
npm run lint
npm run prettier
git add .
git commit -m "feat: add user management"
```

### 7. Code Review Checklist

- [ ] Code mengikuti naming conventions
- [ ] No console.log di production code
- [ ] Error handling yang proper
- [ ] TypeScript types sudah benar
- [ ] Tidak ada hardcoded values
- [ ] Components tidak terlalu besar (< 300 lines)
- [ ] Sudah run prettier
- [ ] Sudah test di browser
- [ ] No TypeScript errors
- [ ] No ESLint warnings

---

## 📚 Resources

### Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Material-UI Docs](https://mui.com/material-ui/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [NextAuth Docs](https://next-auth.js.org/)

### Tools

- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

---

## 🤝 Support & Contact

Jika ada pertanyaan mengenai template ini:

**Maintainer:**  
Muhammad Hilmy Aziz  
📧 mhilmy.aziz05@gmail.com

**Repository:**  
[GitLab - satu/satu-next-template](https://teamgit.telkomuniversity.ac.id/satu/satu-next-template)

---

**Last Updated:** January 2026  
**Version:** 1.0.0

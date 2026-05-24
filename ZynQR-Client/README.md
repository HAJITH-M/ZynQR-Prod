my-react-app/
│
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│
│   ├── app/
│   │   ├── router/
│   │   │   ├── routes.jsx
│   │   │   ├── lazyRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── MarketingLayout.jsx
│   │   │
│   │   ├── providers/
│   │   │   └── AppProviders.jsx
│   │   │
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   └── constants.js
│   │   │
│   │   └── App.jsx
│
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── PrivacyPolicyPage.jsx
│
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── global.css
│   │       └── variables.css
│
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Card.jsx
│   │   │
│   │   └── common/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       ├── Loader.jsx
│   │       └── SEO.jsx
│
│   ├── features/
│   │
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   └── auth.api.js
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── utils/
│   │   │   │   └── auth.helper.js
│   │   │   └── index.js
│   │
│   │   ├── dashboard/
│   │   │   ├── api/
│   │   │   │   └── dashboard.api.js
│   │   │   ├── components/
│   │   │   │   └── StatsCard.jsx
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.jsx
│   │   │   └── index.js
│   │
│   │   ├── users/
│   │   │   ├── api/
│   │   │   │   └── users.api.js
│   │   │   ├── components/
│   │   │   │   └── UserTable.jsx
│   │   │   ├── pages/
│   │   │   │   └── UsersPage.jsx
│   │   │   └── index.js
│
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   └── useFetch.js
│
│   ├── lib/
│   │   ├── axios.js
│   │   └── queryClient.js
│
│   ├── services/
│   │   ├── storage.service.js
│   │   ├── notification.service.js
│   │   └── logger.service.js
│
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── validators.js
│   │   └── helpers.js
│
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .env.production
├── .gitignore
├── eslint.config.js
├── vite.config.js
├── package.json
└── README.md
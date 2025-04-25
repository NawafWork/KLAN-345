# Charity Web Application

A full-stack web application for managing and contributing to charity projects, built with Django REST Framework and React.

## Installation & Setup

### Backend Setup (Django)

1. Clone the repository and create a virtual environment:
```bash
git clone <repository-url>
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

# Generate a new secret key using Python:
# In your terminal, run:
# python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY=your-generated-secret-key

3. Create a .env file in the backend directory:
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=charityweb
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

Make sure to enable app password (gmail use only)

4. Set up the database:
Create a postgreSQL database 

DB_NAME=charityweb
DB_USER=postgres
DB_PWD=your-password
DB_HOST=localhost
DB_PORT=5432
DEBUG=True

```bash
python manage.py makemigrations
python manage.py migrate
```

5. Run the development server:
```bash
python manage.py runserver
```

### Frontend Setup (React)

1. Navigate to the frontend directory:
```bash
cd frontend
npm install
```

2. Create a .env file:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
```

3. Start the development server:
```bash
npm start
```

## Implementation

### Core Features

1. **Authentication System**
   - JWT-based authentication using Djoser
   - Token refresh mechanism
   - Password reset and email verification
   - Custom user model with extended fields

2. **Charity Project Management**
   - CRUD operations for charity projects
   - Location-based project tracking using MapBox
   - Progress tracking with donation goals
   - File upload and management

3. **Donation System**
   - Secure payment processing
   - Email notifications for donations
   - Goal achievement tracking
   - Transaction history

### Architecture & Component Interaction

1. **Frontend-Backend Communication**
```javascript
// Axios instance configuration
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});
```

2. **State Management with Redux**
```javascript
// Action creators
export const createProject = (formData, navigate) => async dispatch => {
    try {
        const res = await axiosInstance.post('/api/charities/projects/', formData);
        dispatch({
            type: CREATE_PROJECT,
            payload: res.data
        });
    } catch (err) {
        // Error handling
    }
};
```

3. **MapBox Integration**
```javascript
const ProjectsMap = ({ projects }) => {
    return (
        <Map
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            // Map configuration
        >
            {projects.map(project => (
                <Marker key={project.id} 
                    latitude={project.latitude}
                    longitude={project.longitude}>
                    // Marker content
                </Marker>
            ))}
        </Map>
    );
};
```

## Testing

### Test Strategy

1. **Unit Tests**
   - Backend: Django TestCase for models and views
   - Frontend: Jest and React Testing Library

2. **Integration Tests**
   - API endpoint testing
   - Redux action/reducer integration
   - Form submission flows

3. **End-to-End Tests**
   - User journey testing
   - Cross-browser compatibility

### Sample Test Cases

```python
class CharityProjectTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(...)
        self.client = APIClient()
        
    def test_create_project(self):
        data = {
            'title': 'Test Project',
            'description': 'Test Description',
            'goal_amount': 1000.00
        }
        response = self.client.post('/api/charities/projects/', data)
        self.assertEqual(response.status_code, 201)
```

### Stop Testing Criteria
- All test cases pass successfully
- 80% code coverage achieved
- No critical or high-priority bugs remaining
- Performance benchmarks met

## Security Measures

1. **JWT Authentication**
   - Token-based authentication
   - Refresh token mechanism
   - Password hashing

2. **CORS Configuration**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
]
```

3. **Input Validation**
   - Form validation
   - API request validation
   - SQL injection prevention

## Performance Optimization

1. **Frontend**
   - Lazy loading of components
   - Redux state optimization
   - Image optimization

2. **Backend**
   - Database query optimization
   - Caching implementation
   - Pagination for large datasets

## Usability Features

1. **User Interface**
   - Responsive design
   - Intuitive navigation
   - Form validation feedback
   - Loading states

2. **Error Handling**
   - User-friendly error messages
   - Graceful error recovery
   - Network error handling

## Deployment Considerations

1. **Environment Configuration**
   - Separate development/production settings
   - Environment variable management
   - Static file serving

2. **Database Management**
   - Migration management
   - Backup procedures
   - Data integrity checks
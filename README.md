# README for Social Media Platform

## Project Overview
This is a simple social media platform where users can:
- Sign up and log in using JWT authentication.
- Create posts with text and optional image uploads.
- Comment on posts.
- View a real-time feed of posts and comments.

### Key Features
- **User Authentication**: Secure login and registration with JWT.
- **Post Creation**: Add captions and upload images (stored in Amazon S3).
- **Commenting**: Add comments on posts.
- **Real-Time Updates**: Posts and comments update live using Socket.io and Redis.
- **Data Persistence**: Metadata is stored in MongoDB.
- **API Documentation**: Endpoints documented using Swagger.


## Frontend Repository

### Prerequisites
1. **Node.js** (version 14.x or above)


### Installation and Running

1. Clone the repository:
   ```bash
   git clone https://github.com/maazshaikh1711/machinehack-frontend.git
   cd frontend_repo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm start
   ```

The frontend will be running at `http://localhost:3000/`.


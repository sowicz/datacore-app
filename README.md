# Dashboard Management Application

A web-based dashboard built with [RemixJS](https://remix.run), designed to simplify the management of links, users, check Docker containers, and in the future MQTT brokers. This application is user-friendly, and ideal for administrative tasks.

## Features

### 1. **Link Management**
- Add, edit, and delete links to internal websites/apps.
- User-friendly forms for managing your collection of links.

### 2. **User Management**
- Add, edit, and delete users.
- Manage roles and permissions for platform users.

### 3. **Docker Containers Overview**
- View a list of running Docker containers.
- Monitor container statuses 

### 4. **MQTT Broker User Management (planned)** 
- Manage users and permissions for MQTT brokers like EMQX or Mosquitto.
- Support for adding, editing, and removing MQTT users.

## Tech Stack
- **Frontend**: [RemixJS](https://remix.run)
- **Backend**: Node.js with Remix server capabilities
- **Database**: [SQLite](https://www.sqlite.org/index.html) 
- **Containerization**: Docker

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```
2. Install dependencies:
    ```
    npm install
    ```
3. Configure environment variables: Create a .env file in the root of the project and define the required variables:
    ```
    NODE_ENV="development"
    ADMIN_PASSWORD=
    ```
4. Seed the Prisma database: Before starting the development server, initialize the database with seed data:
    ```
    npm run prisma:seed
    ```
    Please don't have opened db while seeding because seed will fail.
     
5. Start the development server:
    ```
    npm run dev
    ```

## Contributing
Contributions are welcome! 
Feel free to submit issues, feature requests, or pull requests to improve this application.

### Future Plans
- Integration with EMQX or Mosquitto for MQTT user management.
- Enhanced Docker container management capabilities.

Made with ❤️ using RemixJS.

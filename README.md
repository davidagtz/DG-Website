# My personal developer website

This website was built to show off my personal projects

Here are the schema:

- User
```json
    {
        bsonType: "object",
        required: ["user", "name" "email", "pwd", "projectIDs"],
        user: {
            bsonType: "string",
            description: "This is the username of the user"
        }
        name: {
            bsonType: "string",
            description: "This is the name of the user"
        }
        email: {
            bsonType: "string",
            description: "This is the user's email"
        }
        pwd: {
            bsonType: "string",
            description: "This is the salted and hashed password of the user"
        }
        projectIDS: {
            bsonType: "array",
            description: "Theses are all the projects of the user"
        }
        session: {
            bsonType: "string",
            description: "session ID for the user"
        }
    }
```

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SoundNest API",
      version: "1.0.0",
      description:
        "Documentación de la API de SoundNest desarrollada con Node.js, Express y MySQL."
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Servidor local de desarrollo"
      }
    ],
    tags: [
      { name: "Auth", description: "Autenticación de usuarios" },
      { name: "Users", description: "Gestión de cuentas de usuario" },
      { name: "Albums", description: "Catálogo de álbumes" },
      { name: "Songs", description: "Catálogo de canciones" },
      { name: "Playlists", description: "Listas de reproducción" },
      { name: "Favorites", description: "Canciones favoritas del usuario" },
      { name: "Reviews", description: "Reseñas y valoraciones de canciones" }
    ]
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

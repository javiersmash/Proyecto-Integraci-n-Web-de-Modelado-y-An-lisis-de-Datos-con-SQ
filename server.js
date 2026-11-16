
const express = require("express");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./swagger");
const playlistsRoutes = require("./routes/playlists.routes");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const albumsRoutes = require("./routes/albums.routes");
const songsRoutes = require("./routes/songs.routes");

const api = express();
const PORT = 5000;

api.use(express.json());
api.use(express.static("public"));

// Documentación Swagger
api.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
api.use("/auth", authRoutes);
api.use("/users", usersRoutes);
api.use("/albums", albumsRoutes);
api.use("/songs", songsRoutes);
api.use("/playlists", playlistsRoutes);


api.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});

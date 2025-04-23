const {obtenerJuegos, agregarJuego} = require("../data/gamesData");


module.exports = {
  getGames: async (req, res) => {
    try{
      const games = await obtenerJuegos();
      res.json(games);
    } catch (error) {
      console.error("Error al obtener juegos:", error);
      res.status(500).json({ error: "Error al obtener los juegos" });
    }
  },

  addGame: async (req, res) => {
    try {
      const nuevoJuego = req.body;
      const juegoAgregado = await agregarJuego(nuevoJuego);
      res.status(201).json(juegoAgregado);
    } catch (error) {
      console.error("Error al agregar juego:", error);
      res.status(400).json({ error: "Error al agregar juego" });
    }
  }
};
  
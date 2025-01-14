// File: controllers/ongkirController.js
import axios from "axios";

const API_KEY = "f7fb3cee44a1a9ea537c9b116753c141"; // Ganti dengan API key Anda
const BASE_URL = "http://api.rajaongkir.com/starter";

const ongkirController = {
  getOngkir: async (req, res) => {
    try {
      const { origin, destination, weight, courier } = req.body;

      const response = await axios.post(
        `${BASE_URL}/cost`,
        new URLSearchParams({
          origin,
          destination,
          weight,
          courier,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            key: API_KEY,
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost data", error });
    }
  },

  getProvinces: async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/province`, {
        headers: {
          key: API_KEY,
        },
      });

      res.json(response.data.rajaongkir.results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch province data", error });
    }
  },

  getCities: async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/city`, {
        headers: {
          key: API_KEY,
        },
      });

      res.json(response.data.rajaongkir.results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch city data", error });
    }
  },

  getCitiesByProvince: async (req, res) => {
    try {
      const { provinceId } = req.params;

      const response = await axios.get(
        `${BASE_URL}/city?province=${provinceId}`,
        {
          headers: {
            key: API_KEY,
          },
        }
      );

      res.json(response.data.rajaongkir.results);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch city data by province", error });
    }
  },
};

export default ongkirController;

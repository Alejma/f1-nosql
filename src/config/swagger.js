const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'F1 Pro API',
      version: '1.0.0',
      description: 'API REST para gestión de datos de Fórmula 1 con MongoDB (desnormalizado) y Redis',
      contact: {
        name: 'F1 Pro API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        Driver: {
          type: 'object',
          required: ['name', 'number', 'nationality', 'teamId'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del piloto',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Nombre completo del piloto',
              example: 'Max Verstappen',
            },
            number: {
              type: 'number',
              description: 'Número del piloto',
              example: 33,
            },
            nationality: {
              type: 'string',
              description: 'Nacionalidad del piloto',
              example: 'Dutch',
            },
            teamName: {
              type: 'string',
              description: 'Nombre del equipo (redundante)',
              example: 'Red Bull Racing',
            },
            teamId: {
              type: 'string',
              description: 'ID del equipo',
              example: '507f1f77bcf86cd799439012',
            },
            team: {
              type: 'object',
              description: 'Información desnormalizada del equipo',
              properties: {
                name: {
                  type: 'string',
                  example: 'Red Bull Racing',
                },
                country: {
                  type: 'string',
                  example: 'Austria',
                },
                points: {
                  type: 'number',
                  example: 720,
                },
              },
            },
            points: {
              type: 'number',
              description: 'Puntos totales del piloto',
              example: 410,
              default: 0,
            },
            currentPosition: {
              type: 'number',
              description: 'Posición actual en el campeonato',
              example: 1,
              default: 0,
            },
          },
        },
        Team: {
          type: 'object',
          required: ['name', 'country'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del equipo',
              example: '507f1f77bcf86cd799439012',
            },
            name: {
              type: 'string',
              description: 'Nombre del equipo',
              example: 'Red Bull Racing',
            },
            country: {
              type: 'string',
              description: 'País de origen del equipo',
              example: 'Austria',
            },
            points: {
              type: 'number',
              description: 'Puntos totales del equipo',
              example: 720,
              default: 0,
            },
            drivers: {
              type: 'array',
              description: 'Array de pilotos del equipo',
              items: {
                type: 'object',
                properties: {
                  driverId: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011',
                  },
                  driverName: {
                    type: 'string',
                    example: 'Max Verstappen',
                  },
                  driverPoints: {
                    type: 'number',
                    example: 410,
                  },
                },
              },
            },
          },
        },
        Race: {
          type: 'object',
          required: ['name', 'circuit', 'date'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la carrera',
            },
            name: {
              type: 'string',
              description: 'Nombre del Gran Premio',
              example: 'Gran Premio de Mónaco',
            },
            circuit: {
              type: 'string',
              description: 'Nombre del circuito',
              example: 'Circuit de Monaco',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de la carrera',
              example: '2025-05-25T14:00:00Z',
            },
            results: {
              type: 'array',
              description: 'Resultados de la carrera',
              items: {
                type: 'object',
                properties: {
                  driverId: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011',
                  },
                  driverName: {
                    type: 'string',
                    example: 'Max Verstappen',
                  },
                  teamName: {
                    type: 'string',
                    example: 'Red Bull Racing',
                  },
                  position: {
                    type: 'number',
                    example: 1,
                  },
                  points: {
                    type: 'number',
                    example: 25,
                  },
                },
              },
            },
          },
        },
        Season: {
          type: 'object',
          required: ['year'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la temporada',
            },
            year: {
              type: 'number',
              description: 'Año de la temporada',
              example: 2025,
            },
            races: {
              type: 'array',
              description: 'Array de carreras de la temporada',
            },
            standings: {
              type: 'array',
              description: 'Tabla de posiciones de la temporada',
              items: {
                type: 'object',
                properties: {
                  driverId: {
                    type: 'string',
                  },
                  driverName: {
                    type: 'string',
                  },
                  teamName: {
                    type: 'string',
                  },
                  points: {
                    type: 'number',
                  },
                  position: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
        Standings: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['redis', 'mongodb'],
              description: 'Fuente de los datos',
            },
            year: {
              type: 'number',
              description: 'Año de la temporada',
            },
            raceActive: {
              type: 'boolean',
              description: 'Indica si hay una carrera activa',
            },
            standings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  driverName: {
                    type: 'string',
                  },
                  team: {
                    type: 'string',
                  },
                  points: {
                    type: 'number',
                  },
                  position: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
        Leaderboard: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              driverId: {
                type: 'string',
              },
              driverName: {
                type: 'string',
              },
              position: {
                type: 'number',
              },
              currentLap: {
                type: 'number',
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Mensaje de error',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


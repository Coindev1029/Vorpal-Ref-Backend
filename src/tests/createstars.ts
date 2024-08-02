import { generateRandomString } from '../utils/text';
import {createStar} from '../models/stars';
import { Race } from 'types';

const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;


const createRandomStars = async (n: number) => {
for (let i = 0; i < n; i++) {
      const params = {
        owner: '',
        name: generateRandomString(10),
        is_live: Math.random() < 0.5,
        creation: Math.floor(Date.now() / 1000),
        updated: null, 
        level: randomInRange(1, 10),
        fuel: randomInRange(100, 1000),
        level_up_fuel: randomInRange(10, 100),
        fuel_spendings: randomInRange(1, 50),
        habitable_zone_min: randomInRange(1, 100),
        habitable_zone_max: randomInRange(101, 200),
        planet_slots: randomInRange(1, 10),
        mass: randomInRange(1000, 5000),
        race: ((): Race => {
            const cntr = Math.ceil(Math.random() * 4);
            switch (cntr) {
                case 1:
                    return 'Humans'
                    break;
                case 2:
                    return 'Waters'
                case 3: 
                    return 'Insects'
                case 4:
                    return 'Lizards'
                default: 
                    return 'Humans'
            }
        })(),
        coords: [
          randomInRange(1000000 - 1000, 1000000 + 1000),
          randomInRange(1000000 - 1000, 1000000 + 1000),
          randomInRange(1000000 - 1000, 1000000 + 1000)
        ]
      };
  
      try {
        await createStar(params);
        console.log(`Star ${i + 1} created.`);
      } catch (error) {
        console.error(`Error creating star ${i + 1}:`, error);
      }
    }
  };
  
  createRandomStars(10);
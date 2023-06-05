const CarController = require('../app/controllers/CarController');

describe('Car Controller', () => {
  let carController;
  let carModel;
  let userCarModel;
  let dayjs;

  beforeEach(() => {
    carModel = {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      count: jest.fn(),
    };

    userCarModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    dayjs = jest.fn();

    carController = new CarController({ carModel, userCarModel, dayjs });
  });

  describe('handleListCars', () => {
    it('should return list of cars with pagination meta', async () => {
      // Arrange
      const req = {
        query: {
          pageSize: 10,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockCars = [{ name: 'Car 1' }, { name: 'Car 2' }];
      const mockCarCount = 2;
      const mockPagination = { currentPage: 1, totalPages: 1, pageSize: 10, totalCount: 2 };

      carModel.findAll.mockResolvedValue(mockCars);
      carModel.count.mockResolvedValue(mockCarCount);
      carController.buildPaginationObject = jest.fn().mockReturnValue(mockPagination);

      // Act
      await carController.handleListCars(req, res);

      // Assert
      expect(carModel.findAll).toHaveBeenCalled();
      expect(carModel.count).toHaveBeenCalled();
      expect(carController.buildPaginationObject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        cars: mockCars,
        meta: {
          pagination: mockPagination,
        },
      });
    });
  });

  describe('handleGetCar', () => {
    it('should return car data', async () => {
      // Arrange
      const req = {
        params: {
          id: 1,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockCar = { id: 1, name: 'Car 1' };
      carModel.findByPk.mockResolvedValue(mockCar);

      // Act
      await carController.handleGetCar(req, res);

      // Assert
      expect(carModel.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe('handleCreateCar', () => {
    it('should create a new car', async () => {
      // Arrange
      const req = {
        body: {
          name: 'Car 1',
          price: 10000,
          size: 'Small',
          image: 'car1.jpg',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockCreatedCar = { id: 1, ...req.body };
      carModel.create.mockResolvedValue(mockCreatedCar);

      // Act
      await carController.handleCreateCar(req, res);

      // Assert
      expect(carModel.create).toHaveBeenCalledWith({
        name: 'Car 1',
        price: 10000,
        size: 'Small',
        image: 'car1.jpg',
        isCurrentlyRented: false,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedCar);
    });

    it('should handle error and return 422 status code', async () => {
      // Arrange
      const req = {
        body: {
          name: 'Car 1',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockError = new Error('Validation error');
      carModel.create.mockRejectedValue(mockError);

      // Act
      await carController.handleCreateCar(req, res);

      // Assert
      expect(carModel.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: mockError.name,
          message: mockError.message,
        },
      });
    });
  });

  // Tambahkan pengujian untuk fungsi-fungsi controller lainnya sesuai kebutuhan
});

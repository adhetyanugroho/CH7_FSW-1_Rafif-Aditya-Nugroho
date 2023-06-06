const ApplicationController = require('../app/controllers/ApplicationController');
const { NotFoundError } = require('../app/errors');

describe('Application Controller Testing', () => {
  let applicationController;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    applicationController = new ApplicationController();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('handleGetRoot should return a JSON response with status 200', () => {
    applicationController.handleGetRoot(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'OK',
      message: 'BCR API is up and running!',
    });
  });

  it('handleNotFound should return a JSON response with status 404 and error details', () => {
    const method = 'POST';
    const url = 'https://cars';
    const expectedError = new NotFoundError(method, url);

    applicationController.handleNotFound(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        name: expectedError.name,
        message: expectedError.message,
        details: expectedError.details,
      },
    });
  });

  it('handleError should return a JSON response with status 500 and error details', () => {
    const error = new Error('Something went wrong');

    applicationController.handleError(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        name: error.name,
        message: error.message,
        details: null,
      },
    });
  });

  it('getOffsetFromRequest should return the correct offset based on query parameters', () => {
    mockReq.query = {
      page: 3,
      pageSize: 10,
    };

    const offset = applicationController.getOffsetFromRequest(mockReq);

    expect(offset).toEqual(20);
  });

  it('buildPaginationObject should return the correct pagination object based on query parameters and count', () => {
    mockReq.query = {
      page: 2,
      pageSize: 10,
    };
    const count = 35;

    const pagination = applicationController.buildPaginationObject(mockReq, count);

    expect(pagination).toEqual({
      page: 2,
      pageCount: 4,
      pageSize: 10,
      count: 35,
    });
  });
});

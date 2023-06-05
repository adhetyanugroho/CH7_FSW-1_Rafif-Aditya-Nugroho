const ApplicationController = require('../app/controllers/ApplicationController');
const { NotFoundError } = require('../app/errors');

describe('Application Controller Testing', () => {
  let applicationController;
  let req;
  let res;
  let next;

  beforeEach(() => {
    applicationController = new ApplicationController();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('handleGetRoot should return a JSON response with status 200', () => {
    applicationController.handleGetRoot(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'OK',
      message: 'BCR API is up and running!',
    });
  });

  // it('handleNotFound should return a JSON response with status 404 and error details', () => {
  //   const method = 'GET';
  //   const url = '/path';
  //   const expectedError = new NotFoundError(method, url);

  //   applicationController.handleNotFound(req, res);

  //   expect(res.status).toHaveBeenCalledWith(404);
  //   expect(res.json).toHaveBeenCalledWith({
  //     error: {
  //       name: expectedError.name,
  //       message: expectedError.message,
  //       details: expectedError.details,
  //     },
  //   });
  // });

  it('handleError should return a JSON response with status 500 and error details', () => {
    const error = new Error('Something went wrong');

    applicationController.handleError(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        name: error.name,
        message: error.message,
        details: null,
      },
    });
  });

  it('getOffsetFromRequest should return the correct offset based on query parameters', () => {
    req.query = {
      page: 3,
      pageSize: 10,
    };

    const offset = applicationController.getOffsetFromRequest(req);

    expect(offset).toEqual(20);
  });

  it('buildPaginationObject should return the correct pagination object based on query parameters and count', () => {
    req.query = {
      page: 2,
      pageSize: 10,
    };
    const count = 35;

    const pagination = applicationController.buildPaginationObject(req, count);

    expect(pagination).toEqual({
      page: 2,
      pageCount: 4,
      pageSize: 10,
      count: 35,
    });
  });
});

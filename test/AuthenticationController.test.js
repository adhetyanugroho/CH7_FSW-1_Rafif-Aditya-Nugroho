const AuthenticationController = require('../app/controllers/AuthenticationController');
const { EmailNotRegisteredError, WrongPasswordError, RecordNotFoundError } = require('../app/errors');

describe('Authentication Controller Testing', () => {
  let authenticationController;
  let req;
  let res;
  let next;
  let userModelMock;
  let roleModelMock;
  let bcryptMock;
  let jwtMock;

  beforeEach(() => {
    userModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    roleModelMock = {
      findOne: jest.fn(),
      findByPk: jest.fn(),
    };

    bcryptMock = {
      hashSync: jest.fn(),
      compareSync: jest.fn(),
    };

    jwtMock = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    authenticationController = new AuthenticationController({
      userModel: userModelMock,
      roleModel: roleModelMock,
      bcrypt: bcryptMock,
      jwt: jwtMock,
    });

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('handleLogin should return a JSON response with status 201 and access token', async () => {
    const email = 'test@example.com';
    const password = 'password';
    const user = {
      id: 1,
      name: 'Test User',
      email,
      encryptedPassword: 'encryptedPassword',
      Role: {
        id: 1,
        name: 'CUSTOMER',
      },
    };

    const accessToken = 'access_token';

    userModelMock.findOne.mockResolvedValue(user);
    bcryptMock.verify.mockReturnValue(true);
    jwtMock.sign.mockReturnValue(accessToken);

    req.body = { email, password };

    await authenticationController.handleLogin(req, res, next);

    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where: { email },
      include: [{ model: roleModelMock, attributes: ['id', 'name'] }],
    });
    expect(bcryptMock.verify).toHaveBeenCalledWith(password, user.encryptedPassword);
    expect(jwtMock.sign).toHaveBeenCalledWith({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: {
        id: user.Role.id,
        name: user.Role.name,
      },
    }, expect.any(String));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      accessToken,
    });
  });

  it('handleRegister should return a JSON response with status 201 and access token', async () => {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password';
    const role = {
      id: 1,
      name: 'CUSTOMER',
    };
    const user = {
      id: 1,
      name,
      email,
      encryptedPassword: 'encryptedPassword',
    };

    const accessToken = 'access_token';

    userModelMock.findOne.mockResolvedValue(null);
    roleModelMock.findOne.mockResolvedValue(role);
    userModelMock.create.mockResolvedValue(user);
    bcryptMock.hashSync.mockReturnValue('encryptedPassword');
    jwtMock.sign.mockReturnValue(accessToken);

    req.body = { name, email, password };

    await authenticationController.handleRegister(req, res, next);

    expect(userModelMock.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(roleModelMock.findOne).toHaveBeenCalledWith({ where: { name: authenticationController.accessControl.CUSTOMER } });
    expect(userModelMock.create).toHaveBeenCalledWith({
      name,
      email,
      encryptedPassword: 'encryptedPassword',
      roleId: role.id,
    });
    expect(bcryptMock.hashSync).toHaveBeenCalledWith(password, 10);
    expect(jwtMock.sign).toHaveBeenCalledWith({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: {
        id: role.id,
        name: role.name,
      },
    }, expect.any(String));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      accessToken,
    });
  });

  it('handleGetUser should return a JSON response with status 200 and user data', async () => {
    const userId = 1;
    const user = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      Role: {
        id: 1,
        name: 'CUSTOMER',
      },
    };

    userModelMock.findByPk.mockResolvedValue(user);
    roleModelMock.findByPk.mockResolvedValue(user.Role);

    req.user = { id: userId };

    await authenticationController.handleGetUser(req, res);

    expect(userModelMock.findByPk).toHaveBeenCalledWith(userId);
    expect(roleModelMock.findByPk).toHaveBeenCalledWith(user.roleId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('handleGetUser should return a JSON response with status 404 if user not found', async () => {
    const userId = 1;

    userModelMock.findByPk.mockResolvedValue(null);

    req.user = { id: userId };

    await authenticationController.handleGetUser(req, res);

    expect(userModelMock.findByPk).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
  });
});

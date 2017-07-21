# 📢 api-to
> IDwall API Boilerplate

## Overview

At IDwall, one of our main project is an API that is used by our customers to interact with their data.

This boilerplate always changes based on decisions we make over time, thats why we're always developing and improving it, so any suggestions would be appreciated.

## Features

- `Dockerfile` ready for production
- Development environment with `docker-compose`
    - Live reload
    - Separated build & run scripts
    - Linting
- Clean implementation and code structure
- Dependency injection
- Decorators for route configuration
- Example database service interface & implementation
- YAML configurations
    - Any setting can be replaced through environment variables

## Dependencies

- [Hapi.js](https://hapijs.com/)
    - [Hapi](https://github.com/hapijs/hapi)
    - [Boom](https://github.com/hapijs/boom)
    - [Hoek](https://github.com/hapijs/hoek)
    - [Joi](https://github.com/hapijs/joi)
- [InversifyJS](https://github.com/inversify/InversifyJS)
- [Bunyan](https://github.com/trentm/node-bunyan)
- [nconf](https://github.com/indexzero/nconf)

## Usage

This project is intended to be used as a base for your own projects. How you'll be doing this is completely up to you. Some people prefer to fork the project while others prefer just copying its contents to a new repository and working from there.

## Building

There's a Dockerfile that will do pretty much all you need to get a container ready for production. If you don't use docker, you'll need to execute several steps to get the project ready to launch, but we do recommend using docker and docker-compose for development your development environment since there are several advantages in doing so.

If you still want to use it without docker, here's the basic steps to get the project running:

### 1. Get the files

```
git clone https://github.com/idwall/api-to.git
cd api-to
```

### 2. Install dependencies

```
npm install -g typescript
npm install
```

### 3. Compile the source

```
tsc
```

### 4. Run

```
node index
```

## License

[MIT](LICENSE.md)

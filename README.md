# Building a REST API with NestJS and prisma

This repository contains the starter project for the **Building a REST API with NestJS and Prisma** workshop by [Marc Stammerjohann](https://twitter.com/mrcjln).
## Getting Started

1. Clone this repository

You can clone this repository with the following command:

```bash
# SSH
git clone git@github.com:marcjulian/nestjs-prisma-workshop.git

# HTTPS
git clone https://github.com/marcjulian/nestjs-prisma-workshop.git

# GitHub CLI
gh repo clone marcjulian/nestjs-prisma-workshop
```

2. Install dependencies

```bash
cd nestjs-prisma-workshop
npm install
```

3. Install NestJS CLI if you haven't already

```bash
npm i -g @nestjs/cli
```

## NestJS REPL
[REPL Documenation](https://docs.nestjs.com/recipes/repl)
```bash
# Run REPL
$ npm run start -- --entryFile repl

# Run REPL in watch mode
$ npm run start -- --watch --entryFile repl
```

### Notes

#### Using faker

```javascript
> const {faker} = require('@faker-js/faker')
> faker.string.uuid()
'213eaa3d-f74d-4a3b-af36-21c6fe4dc43b'
```

#### Multiline
.editor

#### output of last command

_ (i.e., the underscore variable)
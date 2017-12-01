Fulton Proof of Concept

I want to copy some idea from Angular, like Dependency Injection, because Angular has its own compiler, so I worries some ideas like type can't works on regular nodejs. So use these projects to test out the language capabilities.

## Packages
- `fulton` is abstract and basic package
- `fulton-default` is implementations
- `fulton-example` is the server side
- `fulton-model-decorator` typescript decorator for server and client
- `fulton-client` basic class for client
- `fulton-angular` basic class for angular based on fulton-client
- `fulton-cli` is like angular generator, to create project, files (or use yo)


run these command to create npm package link
```
Fulton > npm link

FultonDefault > npm link fulton
FultonDefault > npm link

FultonExample > npm link fulton, fulton-default
```

### Rename?
fulton to fulton-core?
fulton-default to fulton or fulton-swarm?
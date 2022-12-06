## What's in it for you?
+ A common way to read your app config
+ Something that's, hopefully, error free
+ Describe the config you want, not how you need to read it
+ Some type safety

## What was in it for me?
+ A chance to play with library writing
+ Fun way to write some more cat theory type code
+ I like seeing what I can achieve with the TS type system
+ Solved a real life problem I faced at work

## What's the problem?
+ No type inference of config objects
+ `process.env['var_name']` can be error-prone
+ Reading one key can fail, you fix it and then another one could be wrong - errors don't accumulate

## What's a solution?
+ Use a DSL to describe the desired config object and use some inference magic
+ Have a small, composable set of functions that reliably read primitive values
+ Lean on applicative validation to roll-up all the errors

## Influences
+ Scala PureConfig
+ Typescript Zod


## A Working Example
Let's start with a pretty basic example of how we might (admittedly naively) read some config from the process env.
Say we had a couple of helper functions that would fetch and do some basic type validations
```typescript
  const getString = (key: string): string => {
  const value = process.env[key]
  if (value === undefined)
    throw new Error(`value for key ${key} is undefined`)

  return value
}

const getBoolean = (key: string): boolean => {
  const strValue = getString(key)
  return strValue.toLowerCase() === "true"
}
```

We can do some basic checks on whether the value we want exists as an environment variable or not but the `getBoolean` function looks like it could be better.
For example, do we really want to default to `false` if the string value isn't "true"? Maybe we could do something like
```typescript

const getBoolean = (key: string): boolean => {
  const strValue = getString(key).toLowerCase()
  if (strValue === "true")
    return true
  else if (strValue === "false")
    return false
  
  throw new Error(`Expected boolean value for ${key} but got ${strValue}`)
}
```

A bit better, but you can see we might start repeating this kind of check in other functions, maybe if we want a number or a list etc. So it's already, in my opinion, starting to look
a bit verbose.
Let's give it a whirl, though.
```typescript
const databaseConfig = {
  dbName: getString("DATABASE_NAME"),
  autoCommit:  getBoolean("DATABASE_AUTO_COMMIT")
}

type DatabaseConfig = typeof databaseConfig
// { dbName: string, autoCommit: boolean }
```

### So what?
There are a few things that I don't like here:
* The 'how' gets in the way of the 'what' - I have to specify how to get the value I want by calling the functions, rather than just describing the config shape.
* If we get an error from `dbName` then everything stops. We can fix it but then `autoCommit` could also throw. That's two fix and rerun cycles for two unrelated values; it would be much
nicer if we could get both of those errors at once.
* The return types of the functions lie.  They hide the fact that something could go wrong and we'd get an exception, so we might get a false sense of how it will behave.


### Using config-ts
Let's go through each of those points and see how config-ts addresses them.


#### 'What' over 'How'
We want some config values; we don't really care how we get them, that's delegated somewhere else. A micro format is available to let us describe what it is we want to read.
We can use these to describe each bit of config we want for different parts of our service, and then have a single call to do the actual read.
```typescript
const databaseConfig = readFromEnvironment({
  dbName: { key: 'DATABASE_NAME', type: 'string' },
  connectionString: { key: 'DATABASE_CONN_STR', type: 'string' },
  autoCommit: { key: 'DATABASE_AUTO_COMMIT', type: 'boolean', default: false }
})
```


#### All the errors at once
For each of the variables that don't depend on each other, i.e. they're not nested or one is used to fetch another, we get a single list of all the errors once we try to reify the config description.

```typescript
import { getConfigUnsafe } from './index'

const databaseConfig = readFromEnvironment({
  dbName: { key: 'DATABASE_NAME', type: 'string' },
  connectionString: { key: 'DATABASE_CONN_STR', type: 'string' },
  autoCommit: { key: 'DATABASE_AUTO_COMMIT', type: 'boolean', default: false }
})

const result = getConfigUnsafe(databaseConfig)
// Error("Missing config keys at startup: DATABASE_NAME, DATABASE_AUTO_COMMIT")
```
#### Functions that tell the truth

import { Context } from '../type'

interface TagDescr {
  name: string
  description?: string
  apis: { name: string; description?: string }[]
}
export const parseBody = ({
  swagger,
  options,
  buffer,
  interfaceDict,
  env
}: Context) => {
  if (swagger.tags === undefined) return

  // get the mapKey map
  const tagDict: Map<string, TagDescr> = new Map([
    ['common', { name: '公共接口', description: '公共接口', apis: [] }]
  ])
  for (const [index, tag] of swagger.tags.entries()) {
    const name = options.tagMapper(tag.name)
    const key: string = name === undefined ? `tag${index}` : name
    const interfaces = [...interfaceDict.entries()]
    const tagDescr = tagDict.get(key)
    const currentApis = interfaces
      .filter(i => i[1].tags.includes(tag.name))
      .map(i => ({ name: i[0], description: i[1].description }))

    if (tagDescr) {
      const { apis, name, description } = tagDescr
      tagDescr.name = [name, tag.name].filter(v => v).join(', ')
      tagDescr.description = [description, tag.description || '']
        .filter(v => v)
        .join(', ')
      tagDescr.apis = apis.concat(
        currentApis.filter(api => !apis.some(api2 => (api2.name = api.name)))
      )
    } else {
      tagDict.set(key, {
        name: tag.name,
        description: tag.description || '',
        apis: currentApis
      })
    }
  }

  const body = env.render('body.njk', {
    tags: tagDict.entries()
  })
  buffer.push(body)
}
import { DocumentNode } from 'graphql'
import { useQuery, UseQueryOptions } from '@vue/apollo-composable'
import { computed, ComputedRef, ref, Ref, watch } from 'vue'
import isEqual from 'lodash/isEqual'

type SortOrder = 'asc' | 'desc'

type NonUndefinedDeep<T> = T extends Record<string, unknown>
  ? { [key in keyof T]-?: NonUndefinedDeep<T[key]> }
  : T extends undefined
  ? never
  : T
type WithoutTypename<T> = T extends Array<infer V>
  ? Array<WithoutTypename<V>>
  : T extends Record<string, any>
  ? { [key in Exclude<keyof T, '__typename'>]: WithoutTypename<T[key]> }
  : T
type EntityFromQuery<Query> = WithoutTypename<Query> extends Record<
  string,
  { records: Array<infer T>; total: number }
>
  ? T
  : never
export type PartialDeep<T> = T extends Array<unknown>
  ? T
  : T extends Record<string, any>
  ? { [key in keyof T]?: PartialDeep<T[key]> }
  : T
export type DefaultVariables<Query, Variables extends { filters: Record<string, any> }> = {
  limit: number
  offset: number
  sort: { field: keyof EntityFromQuery<Query>; order: SortOrder | null }
  filters: NonUndefinedDeep<Variables['filters']>
}

const usePaginatedQuery = <
  Query,
  Variables extends {
    limit: number
    sort: { field: string; order?: SortOrder | null | undefined }
    offset: number
    filters: Record<string, any>
  },
  Entity = EntityFromQuery<Query>
>(
  queryDocument: DocumentNode,
  defaultVariables: DefaultVariables<Query, Variables>,
  options?: () => UseQueryOptions<Query, Variables>
) => {
  const defaultOptions: UseQueryOptions<Query, Variables> = {
    fetchPolicy: 'network-only'
  }

  const variables = ref(defaultVariables) as Ref<Variables>

  const { result, loading } = useQuery<
    Record<keyof Query, { records: Entity[]; total: number }>,
    Variables
  >(
    queryDocument,
    variables,
    options ? () => ({ ...defaultOptions, ...options() }) : defaultOptions
  )

  // For some odd reason watcher can be set on variables, but it doesn't let you access variables state before change
  // (both arguments in the callback hold current variables value)
  // So in order to reset offset, when filters change, this custom tracking of filters is required
  let filtersBefore: Variables['filters'] = { ...defaultVariables.filters }
  watch(
    variables,
    (currentVariables) => {
      const filtersNow = currentVariables.filters
      if (!isEqual(filtersBefore, filtersNow)) {
        variables.value.offset = 0
      }
      filtersBefore = { ...currentVariables.filters }
    },
    { deep: true }
  )

  const parsedQueryResult = computed(() => {
    if (!result.value) return { total: 0, records: [] }
    const keys = Object.keys(result.value) as (keyof Query)[]
    const pageKey = keys.find((key) => key !== '__typename')
    if (!pageKey) throw new Error(`Cannot find page in the query result`)
    const page = result.value[pageKey]
    return {
      total: page.total,
      records: page.records
    }
  })
  const total: ComputedRef<number> = computed(() => parsedQueryResult.value.total)
  const records: ComputedRef<Entity[]> = computed(() => parsedQueryResult.value.records)

  const pageTo = (direction: -1 | 1) => {
    if (direction === 1) {
      variables.value.offset += variables.value.limit
    } else {
      variables.value.offset -= variables.value.limit
    }
  }

  return { variables, loading, records, total, pageTo }
}

export default usePaginatedQuery

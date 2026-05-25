import { addDateRange } from '@/utils/index.js'

describe('Utils:addDateRange', () => {
  it('uses the provided date range without relying on component this', () => {
    const query = {
      pageNum: 1,
      pageSize: 10
    }

    expect(addDateRange(query, ['2026-05-01', '2026-05-24'])).toEqual({
      pageNum: 1,
      pageSize: 10,
      startTime: '2026-05-01',
      endTime: '2026-05-24'
    })
  })

  it('keeps empty date range values stable for initial list requests', () => {
    const query = {
      pageNum: 1,
      pageSize: 10
    }

    expect(addDateRange(query, [])).toEqual({
      pageNum: 1,
      pageSize: 10,
      startTime: '',
      endTime: ''
    })
  })
})

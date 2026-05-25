import {
  extractTodayMemberCount,
  normalizeGoodsList,
  normalizePaymentChannels,
  normalizeRecent,
  normalizeStats,
  normalizeTrend
} from '@/views/dashboard/dashboardData.js'

describe('Dashboard data adapters', () => {
  it('normalizes dashboard stats from backend VO without mock fallback values', () => {
    const stats = normalizeStats({
      todaySales: '128.50',
      todayOrderCount: '6',
      pendingShipCount: 2,
      conversionRate: '33.3'
    })

    expect(stats.todaySales).toBe(128.5)
    expect(stats.todayOrderCount).toBe(6)
    expect(stats.pendingShipCount).toBe(2)
    expect(stats.memberCount).toBe(0)
    expect(stats.conversionRate).toBe(33.3)
  })

  it('normalizes channel, trend and goods payloads from dashboard interfaces', () => {
    expect(normalizePaymentChannels([
      { channelName: '微信H5', orderCount: '3', sales: '99.9' }
    ])).toEqual([
      { name: '微信H5', value: 3, sales: 99.9 }
    ])

    expect(normalizeTrend({
      dates: ['05-23'],
      orderCounts: ['2'],
      sales: ['18.88']
    })).toEqual({
      dates: ['05-23'],
      orderCounts: [2],
      sales: [18.88]
    })

    expect(normalizeGoodsList([
      { goodsId: 7, name: '商品A', actualSales: '12', retailPrice: '19.9', stock: '4', sku: 'SKU-7' }
    ])[0]).toMatchObject({
      id: 7,
      goodsId: 7,
      sales: 12,
      actualSales: 12,
      price: 19.9,
      retailPrice: 19.9,
      stock: 4,
      sku: 'SKU-7'
    })
  })

  it('adapts recent object payload and member trend count', () => {
    expect(normalizeRecent({
      orders: [{ orderSn: 'O1' }],
      members: [{ nickname: 'N1' }]
    })).toEqual({
      orders: [{ orderSn: 'O1' }],
      members: [{ nickname: 'N1' }]
    })

    expect(extractTodayMemberCount({ counts: [1, 2, '5'] }, 0)).toBe(5)
    expect(extractTodayMemberCount({ counts: [] }, 8)).toBe(8)
  })

  it('keeps top goods and low stock goods as separate normalized lists', () => {
    const topGoods = normalizeGoodsList([
      { goodsId: 1, name: '热销商品', actualSales: 99, retailPrice: 199, stock: 30, sku: 'TOP-1' }
    ])
    const lowStockGoods = normalizeGoodsList([
      { goodsId: 2, name: '低库存商品', actualSales: 3, retailPrice: 99, stock: 1, sku: 'LOW-1' }
    ])

    expect(topGoods[0]).toMatchObject({ goodsId: 1, sales: 99, stock: 30 })
    expect(lowStockGoods[0]).toMatchObject({ goodsId: 2, sales: 3, stock: 1 })
  })
})

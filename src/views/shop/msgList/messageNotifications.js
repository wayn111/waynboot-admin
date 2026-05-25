export const staticMessageNotifications = [
  {
    id: 1,
    shopName: '新生彩棉初衣礼盒（婴童）',
    shopId: 1033000,
    shopProductId: 'SKU-1033000',
    msgContext: '当前库存低于安全库存，请及时补货。',
    msgType: '1'
  },
  {
    id: 2,
    shopName: '160*230羊毛手工几何地毯',
    shopId: 1030003,
    shopProductId: 'SKU-1030003',
    msgContext: '有新订单待发货，请尽快处理。',
    msgType: '2'
  },
  {
    id: 3,
    shopName: '日式穿线绣四件套',
    shopId: 1030004,
    shopProductId: 'SKU-1030004',
    msgContext: '当前库存低于安全库存，请及时补货。',
    msgType: '1'
  },
  {
    id: 4,
    shopName: '撞色全亚麻四件套',
    shopId: 1030005,
    shopProductId: 'SKU-1030005',
    msgContext: '有新订单待发货，请尽快处理。',
    msgType: '2'
  }
]

export function createMessageNotifications() {
  return staticMessageNotifications.map(item => ({ ...item }))
}

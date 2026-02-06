import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 项目-库存材料信息 */
export interface Inventory {
  id: number // 主键id
  prjId: number // 项目id
  materialName: string // 材料名称
  spec: string // 规格型号
  brand: string // 材料分类
  materialId: number // 材料id
  meterialName: string // 材料分类名称
  quantity: number // 数量
  unit: string // 单位
  price: number // 单价
  amount: number // 总额
  otherProperties: string // 其他属性
  budgetId: number // 预算id
  budgetName: string // 预算名称
  remark: string // 备注
}

// 项目-库存材料 API
export const InventoryApi = {
  // 查询项目-库存材料分页
  getInventoryPage: async (params: any) => {
    return await request.get({ url: `/prj/inventory/page`, params })
  },

  // 查询项目-库存材料详情
  getInventory: async (id: number) => {
    return await request.get({ url: `/prj/inventory/get?id=` + id })
  },

  // 新增项目-库存材料
  createInventory: async (data: Inventory) => {
    return await request.post({ url: `/prj/inventory/create`, data })
  },

  // 修改项目-库存材料
  updateInventory: async (data: Inventory) => {
    return await request.put({ url: `/prj/inventory/update`, data })
  },

  // 删除项目-库存材料
  deleteInventory: async (id: number) => {
    return await request.delete({ url: `/prj/inventory/delete?id=` + id })
  },

  /** 批量删除项目-库存材料 */
  deleteInventoryList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/inventory/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目-库存材料 Excel
  exportInventory: async (params) => {
    return await request.download({ url: `/prj/inventory/export-excel`, params })
  }
}

import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 客户信息信息 */
export interface Customer {
  id: number // id
  customerName: string // 客户名称
  prjCategoryId: number // 客户分类
  contactName: string // 联系人姓名
  contactPhone: string // 联系人电话
  officeLocation: string // 办公地点
  invoiceTitle: string // 发票抬头
  taxNo: string // 税号
  address: string // 地址
  phone: string // 电话
  bankName: string // 开户行
  bankCard: string // 银行卡号
  status: number // 状态 0.已封存 1.未封存
  remark: string // 备注
}

// 客户信息 API
export const CustomerApi = {
  // 查询客户信息分页
  getCustomerPage: async (params: any) => {
    return await request.get({ url: `/prj/customer/page`, params })
  },

  // 查询客户信息详情
  getCustomer: async (id: number) => {
    return await request.get({ url: `/prj/customer/get?id=` + id })
  },

  // 新增客户信息
  createCustomer: async (data: Customer) => {
    return await request.post({ url: `/prj/customer/create`, data })
  },

  // 修改客户信息
  updateCustomer: async (data: Customer) => {
    return await request.put({ url: `/prj/customer/update`, data })
  },

  // 删除客户信息
  deleteCustomer: async (id: number) => {
    return await request.delete({ url: `/prj/customer/delete?id=` + id })
  },

  /** 批量删除客户信息 */
  deleteCustomerList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/customer/delete-list?ids=${ids.join(',')}` })
  },

  // 导出客户信息 Excel
  exportCustomer: async (params) => {
    return await request.download({ url: `/prj/customer/export-excel`, params })
  },

  // 查询客户信息列表
  getCustomerList: async (params: any) => {
    return await request.get({ url: `/prj/customer/list`, params })
  }
}

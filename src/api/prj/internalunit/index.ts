import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 内部单位信息 */
export interface InternalUnit {
  id: number // id
  unitName: string // 单位名称
  contactName: string // 联系人姓名
  contactPhone: string // 联系人电话
  officeLocation: string // 办公地点
  remark: string // 备注
  status: number // 封存状态
}

// 内部单位 API
export const InternalUnitApi = {
  // 查询内部单位分页
  getInternalUnitPage: async (params: any) => {
    return await request.get({ url: `/prj/internal-unit/page`, params })
  },

  // 查询内部单位详情
  getInternalUnit: async (id: number) => {
    return await request.get({ url: `/prj/internal-unit/get?id=` + id })
  },

  // 新增内部单位
  createInternalUnit: async (data: InternalUnit) => {
    return await request.post({ url: `/prj/internal-unit/create`, data })
  },

  // 修改内部单位
  updateInternalUnit: async (data: InternalUnit) => {
    return await request.put({ url: `/prj/internal-unit/update`, data })
  },

  // 删除内部单位
  deleteInternalUnit: async (id: number) => {
    return await request.delete({ url: `/prj/internal-unit/delete?id=` + id })
  },

  /** 批量删除内部单位 */
  deleteInternalUnitList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/internal-unit/delete-list?ids=${ids.join(',')}` })
  },

  // 导出内部单位 Excel
  exportInternalUnit: async (params) => {
    return await request.download({ url: `/prj/internal-unit/export-excel`, params })
  },

  // 查询内部单位分页
  getInternalUnitList: async (params: any) => {
    return await request.get({ url: `/prj/internal-unit/list`, params })
  }
}

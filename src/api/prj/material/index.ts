import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 项目-材料信息 */
export interface Material {
  id: number // 主键id
  categoryId: number // 分类id
  materialName: string // 材料名称
  unit: string // 计量单位
  spec: string // 规格型号
  brand: string // 品牌
  otherProperties: string // 其他属性
  quantity: number // 数量
  status: number // 封存状态
  remark: string // 备注
}

// 项目-材料 API
export const MaterialApi = {
  // 查询项目-材料分页
  getMaterialPage: async (params: any) => {
    return await request.get({ url: `/prj/material/page`, params })
  },

  // 查询项目-材料详情
  getMaterial: async (id: number) => {
    return await request.get({ url: `/prj/material/get?id=` + id })
  },

  // 新增项目-材料
  createMaterial: async (data: Material) => {
    return await request.post({ url: `/prj/material/create`, data })
  },

  // 修改项目-材料
  updateMaterial: async (data: Material) => {
    return await request.put({ url: `/prj/material/update`, data })
  },

  // 删除项目-材料
  deleteMaterial: async (id: number) => {
    return await request.delete({ url: `/prj/material/delete?id=` + id })
  },

  /** 批量删除项目-材料 */
  deleteMaterialList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/material/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目-材料 Excel
  exportMaterial: async (params) => {
    return await request.download({ url: `/prj/material/export-excel`, params })
  },

  // 查询项目-材料分页
  getCategoryListWithMaterialCount: async (params: any) => {
    return await request.get({ url: `/prj/material/list-with-material-count`, params })
  }
}

import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 项目信息信息 */
export interface Info {
          id: number; // 部门id
          prjName: string; // 项目名称
          prjNo: string; // 项目编号
          prjOverview: string; // 项目概况
          participateStatus: number; // 参与状态
          archiveStatus: number; // 归档状态
          prjStatus: number; // 项目状态
          prjCategory: number; // 项目分类
          ownerId: number; // 项目负责人id
          ownerName: string; // 项目负责人名称
          startWorkDate: string | Dayjs; // 开工日期
          completeDate: string | Dayjs; // 竣工日期
          partyAId: string; // 甲方单位id
          partyAName: string; // 甲方单名称
          constUnitId: number; // 施工单位id
          constUnitName: string; // 施工单位名称
          constAddress: string; // 施工地址
          remark: string; // 备注
  }

// 项目信息 API
export const InfoApi = {
  // 查询项目信息分页
  getInfoPage: async (params: any) => {
    return await request.get({ url: `/prj/info/page`, params })
  },

  // 查询项目信息详情
  getInfo: async (id: number) => {
    return await request.get({ url: `/prj/info/get?id=` + id })
  },

  // 新增项目信息
  createInfo: async (data: Info) => {
    return await request.post({ url: `/prj/info/create`, data })
  },

  // 修改项目信息
  updateInfo: async (data: Info) => {
    return await request.put({ url: `/prj/info/update`, data })
  },

  // 删除项目信息
  deleteInfo: async (id: number) => {
    return await request.delete({ url: `/prj/info/delete?id=` + id })
  },

  /** 批量删除项目信息 */
  deleteInfoList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/info/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目信息 Excel
  exportInfo: async (params) => {
    return await request.download({ url: `/prj/info/export-excel`, params })
  },
}
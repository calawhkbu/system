export default {
  roles: {
    rules: async(
      entity: any,
      { roles = [] }: { roles: { name: string }[] },
      { selectedRoles = [] }: { selectedRoles: string[] }
    ) => {
      if (roles.filter(role => selectedRoles.filter(r => r === role.name))) {
        return true
      }
      return false
    },
    onError: 'WorkflowPage.NotAllowByRole'
  },
  documents: {
    rules: async(
      {
        documents = []
      }: {
        documents: { fileName: string }[]
      },
      user: any,
      { selectedFileName = null }: { selectedFileName?: string }
    ) => {
      if ((documents.filter(({ fileName }) => (fileName === selectedFileName))).length > 0) {
        return true
      }
      return false
    },
    onError: 'WorkflowPage.PleaseUploadFile'
  }
}

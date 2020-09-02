<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 页面 -->
    <el-card>
      <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" align="center">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <!-- row是行 el是列 -->
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="
            ['boxBottom', i1===0 ? 'boxTop' : '', 'vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="6">
                <el-tag closable @close="removeRightByID(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <!-- 通过for 循环嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2=== 0 ? '' : 'boxTop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightByID(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightByID(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="assignPermissionsDialogVisible(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页模式 -->
      <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage4"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="400"
      ></el-pagination>-->
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击编辑显示编辑对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editformInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击分配权限按钮显示对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="resetdefaultKeysData">
      <el-tree :data="permissionsList" :props="treetProps" show-checkbox node-key="id" default-expand-all :default-expanded-keys="defaultKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      //控制添加角色的框的显示与隐藏
      addDialogVisible: false,
      addForm: {
        roleName: "",
        roleDesc: "",
        roleId: "",
      },
      // 根据id查询到的用户信息
      editForm: {},
      addRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      // 控制修改用户框的显示与隐藏
      editDialogVisible: false,
      //控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      permissionsList:[],
      //树形控件的属性绑定对象
      treetProps:{
        children: 'children',
        label: 'authName'
      },
      // 默认选中的权限id
      defaultKeys:[],
      //即将分配权限的id
      roleId:'',
     
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    // handleSizeChange(val) {
    //     console.log(`每页 ${val} 条`);
    //   },
    // handleCurrentChange(val) {
    //     console.log(`当前页: ${val}`);
    // },
    // 监听到取消按钮，然后重置添加角色框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加角色
    async addRoles() {
      // 表单的预校验
      this.$refs.addFormRef.validate(async (valid) => {
        //  console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        this.$message.success("添加角色甜点成功");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    // 展示编辑的对话框
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("roles/" + id);
      console.log(res,'hah');
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 重置表单
    editFormClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改表单信息并提交
    editformInfo() {
      // 表单的预校验
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改用户角色信息失败");
        }
        this.editDialogVisible = false;
        this.$message.success("修改用户角色信息成功");
        this.getRolesList();
      });
    },
    //删除角色信息
    async removeRolesById(id) {
      await this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete("roles/" + id)
            .then((res) => {
              if (res.status == 200) {
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
                this.getRolesList();
              }
            })
            .catch((res) => {
              this.$message({
                type: "info",
                message: "删除失败",
              });
            });
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //根据id删除对应的权限
    async removeRightByID(role, rightId) {
      const congirm = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.$http
            .delete(`roles/${role.id}/rights/${rightId}`)
            .then((res) => {
              console.log(res);
              if (res.status == 200) {
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
              }
              role.children = res.data;
            })
            .catch((res) => {
              this.$message({
                type: "info",
                message: "删除失败",
              });
            });
        })
        .catch((res) => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 获取分配权限
    async assignPermissionsDialogVisible(role) {
      this.roleId = role.id
      const {data :res} = await this.$http.get('rights/tree')
      if(res.meta.status !==200 ){
        return this.$message.error('获取权限数据失败')
      }
      //把获取到的权限数据保存到数据中
      this.permissionsList = res.data
      console.log(this.permissionsList);
      //递归获取三级节点的id
      this.getleafKeys(role,this.defaultKeys),
      this.setRightDialogVisible = true
    },
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defaultKeys数组中
    getleafKeys(node,arr){
      // 如果当前node节点不包括children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item =>
      this.getleafKeys(item,arr))
    },
    // 监听分配权限关闭按钮，然后调用清空defaultKeys数据
    resetdefaultKeysData(){
      this.defaultKeys = []
    },
    // 点击为角色分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      const idStar = keys.join(',')
      const{ data:res } = await this.$http.post(`roles/${this.roleId}/rights`,{ rids:idStar })
      if(res.meta.status !==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    
    
  },
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 6px;
}
.boxBottom {
  border-bottom: 1px solid #eee;
}
.boxTop {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
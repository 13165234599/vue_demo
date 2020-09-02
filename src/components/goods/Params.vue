<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分列参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 商品分类区域 -->
      <el-row class="goods_option">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addFormDialogVisible = true"
          >添加动态参数</el-button>
          <!-- 动态数据列表 -->
          <el-table :data="manyTableData" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialogVisible(scope.row.attr_id) "
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addFormDialogVisible = true"
          >添加静态属性</el-button>
          <!-- 静态属性列表 -->
          <el-table :data="onlyTableData" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialogVisible(scope.row.attr_id) "
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 点击添加按钮，显示添加对话框添加数据 -->
    <el-dialog
      :title="'添加'+ textTitle"
      :visible.sync="addFormDialogVisible"
      width="50%"
      @close="addFormClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormdData">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击编辑按钮，显示编辑对话框并修改 -->
    <el-dialog
      :title="'修改'+ textTitle"
      :visible.sync="editFormDialogVisible"
      width="50%"
      @close="editFormClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editFormDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormdData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      //   级联选择框的配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //   级联选框双向绑定的id数组
      selectCateKeys: [],
      // 被激活的页签的名字
      activeName: "many",
      // 动态数据列表数据
      manyTableData: [],
      // 静态数据列表数据
      onlyTableData: [],
      //控制添加对话框的显示与隐藏
      addFormDialogVisible: false,
      // 添加参数的表单对话框数据
      addForm: {},
      // 添加对话框验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
      },
      //控制编辑对话框的显示与隐藏
      editFormDialogVisible: false,
      // 编辑对话框的表单数据
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //   获取所有商品的分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        this.$message.error("获取商品列表成功");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      this.getParamsData();
    },
    // tab页签点击函数的处理函数
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsData();
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 把只选中一级或者二级的分类的时候，整成空
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        this.manyTableData = []
        this.onlyTableData =[]
        return;
      }
      // console.log(this.selectCateKeys, "aaa");
      // console.log(this.selectCateKeys[2]);
      // 根据所选的分类的id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      });
      console.log(res.data);
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }
      console.log(res.data, "bbb");
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    //监听添加对话框的关闭事件
    addFormClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加数据
    addFormdData() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加数据失败");
        }
        this.$message.success("添加数据成功");
        this.addFormDialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击编辑显示对话框
    async showEditDialogVisible(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      console.log(res, "lll");
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      this.editForm = res.data;
      this.editFormDialogVisible = true;
    },
    // 监听编辑对话框的关闭事件
    editFormClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 编辑对话框，确定保存
    editFormdData() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        // console.log(res.data,"111");
        if (res.meta.status == !200) {
          return this.$message.error("更新数据名称失败");
        }
        this.$message.success("更新数据名称成功");
        this.editFormDialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击删除按钮，删除数据
    removeParams(attr_id) {
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete(`categories/${this.cateId}/attributes/${attr_id}`)
            .then((res) => {
              // console.log(res,"ooo");
              if (res.status == 200 && res.data.meta.status == 200) {
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
              }
              this.getParamsData();
            })

            .catch((res) => {
              this.$message({
                type: "info",
                message: "删除失败",
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 文本框失去焦点或摁下了enter都会触发
      async handleInputConfirm(row){
      if(row.inputValue.trim().length === 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果没有return 则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)

    },
    // 将对 attr_vals的操作保存到数据库
    async saveAttrVals(row){
      //需要发起请求，保存这次操作
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
      {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if(res.meta.status !== 200){
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    // 点击按钮，显示文本输入框
    showInput(row){
      row.inputVisible = true;
      //让文本自动获取焦点
      // $nextTick 方法的作用，就是当页面上的元素被重新渲染以后，才会指定回调函数中的代码
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 删除参数标签
    handleClose(i,row){
       row.attr_vals.splice(i,1)
       this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回为true
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2];
      }
      return null;
    },
    // 动态计算标题的文本
    textTitle() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>

<style scoped>
.goods_option {
  margin: 16px 0 !important;
}
.el-tag {
  margin: 5px;
}
.el-input {
  height: 100px;
  width: 120px;
}
</style>
<style>
</style>
<template>
  <div id="cate">
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <!-- 添加商品按钮 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialogVisible">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 内容区域 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        :border="true"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:#00EC00;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <!-- 级别 -->
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">标签一</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">标签二</el-tag>
          <el-tag type="warning" v-else>标签三</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="option" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialogVisible(scope.row.cat_id)"
          >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 点击添加弹出按钮 -->
    <el-dialog
      title="添加商品"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addDialogVisibleClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击编辑按钮弹出编辑框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品的总数据条数
      total: 0,
      // 商品分类的数据列表，默认为空
      cateList: [],
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
          align: "center",
          headerAlign: "center",
        },
        {
          label: "是否有效",
          prop: "cat_deleted",
          type: "template",
          template: "isok",
          align: "center",
          headerAlign: "center",
        },
        {
          label: "级别",
          prop: "cat_level",
          type: "template",
          template: "level",
          align: "center",
          headerAlign: "center",
        },
        {
          label: "操作",
          prop: "cat_deleted",
          type: "template",
          template: "option",
          align: "center",
          headerAlign: "center",
        },
      ],
      // 控制添加商品的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        //将要添加数据分类的名称
        cat_name: "",
        //分级分类id
        cat_pid: 0,
        //分类层级,默认要添加的是一级分类
        cat_level: 0,
      },
      //添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
      },
      // 父级分类的数据列表
      parentCateList: [],
      //指定cascader级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        children: "children",
        label: "cat_name",
        value: "cat_id",
        // checkStrictly: true(和change-on-select一样的功效 )
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑商品用户的显示与隐藏
      editDialogVisible: false,
      //修改分类的表单数据
      editForm: {
        cat_name: "厨卫电器",
        cat_pid:  0,
        cat_level:  0
     
      },
      // 修改分类名称的规则
      editFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据失败");
      }
      console.log(res.data);
      console.log(res.data.result);
      this.cateList = res.data.result;
      //  给总数据赋值
      this.total = res.data.total;
    },
    //监听pagesize 改变的事件
    handleSizeChange(newpage) {
      this.queryInfo.pagesize = newpage;
      this.getCateList();
    },
    // 监听pagenum的改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getCateList();
    },
    // 点击按钮显示添加商品的对话框
    showCateDialogVisible() {
      // 先获取父级分类对话框
      this.getParentCateList();
      // 再展示对话框
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      console.log(res.data);
      this.parentCateList = res.data;
    },
    //选择项发生变化时触发这个函数
    parentCateChange() {
      console.log(this.selectedKeys);
      //如果selectedKeys 数组中的length大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id为
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类的id为
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确定按钮，添加新的分类
    addCate() {
      // console.log(this.addCateForm)
      // 预校验
      this.$refs.addCateFormRef.validate(async (valid) => {
        console.log(valid);
        // 打印出true（若填了信息就是true） false（没填就是false）
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品分类失败");
        }
        this.$message.success("添加商品分类成功");
        this.addCateDialogVisible = false;
        this.getCateList();
      });
    },
    //监听添加商品弹出框关闭事件，清空数据
    addDialogVisibleClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.cat_pid = 0;
      this.cat_level = 0;
    },
    // 点击编辑显示编辑页面
    async showEditDialogVisible(id) {
      const {data:res} = await this.$http.get('categories/' + id)
      console.log(res);
      console.log(this.editForm);
      if(res.meta.status !== 200){
        return this.$message.error('查询商品信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true;
    },
    // 当编辑框关闭时,重置表单
    editFormClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改编辑框里的内容，并提交到数据表格中
    editFormInfo(){
      this.$refs.editFormRef.validate( async (valid) =>{
        if(!valid) return
     const{ data:res } = await this.$http.put('categories/' + this.editForm.cat_id,
        {
          cat_name:this.editForm.cat_name
        })
        console.log(res,'ddd');
        if(res.meta.status !==200){
          return this.$message.error('修改分类名称失败')
        }
        this.editDialogVisible = false
        this.$message.success('修改分类名称成功')
        this.getCateList()
      })
    },
    removeCateById(id){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          this.$http.delete('categories/' + id)
          .then( res =>{
            console.log(res,'ggg');
            if(res.status == 200){
              this.$message({
                  type: 'success',
                  message: '删除成功!'
              })
            }
            this.getCateList()
          })
          .catch( res =>{
              this.$message({
                type: 'info',
                message: '删除失败'
              }); 
          })   
        })
        .catch((res) => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    }
    
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 16px;
}
.el-cascader {
  width: 100%;
}
</style>

<style>
.el-cascader-menu__wrap {
  height: 204px !important;
}
.zk-table__body-cell,
.zk-table__footer-cell,
.zk-table__header-cell {
  text-align: center !important;
}
</style>
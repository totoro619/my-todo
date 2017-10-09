; (function(){

 	'use strict';

 	var $form_add_task = $('.add-task');
 	var $delete_task,
 		$task_detail_trigger,
 		$update_form,
 		$task_detail_content,
 		$task_detail_content_input,
 		$checkbox_complete,
 		$task_detail = $('.task-detail'),
 		$task_detail_mask = $('.task-detail-mask'),
 		$content = $('.content'),
 		$msg = $('.msg'),
 		$msg_content = $msg.find('.msg-content'),
 		$msg_confirm = $msg.find('.confirmed');
 	var	task_list = [];


 	init();

 	function listen_msg_status(){
 		$msg_confirm.on('click',function(){
 			hide_msg();
 		})
 	}

 	$form_add_task.on('submit', function(e){
 		
 		var new_task = {};
 		var $input=$(this).find('input[name=content]')
 		//禁用默认行为
 		e.preventDefault();
 		//获取新Task的值
 		new_task.content=$input.val();
 		//如果新Task的值为空，则直接返回，否则继续执行
 		if (!new_task.content)return;
 		//存入新Task值
 		if( add_task(new_task) ) {
 			$input.val('');
 		}
 		
 	})


 	//查找并监听所有删除按钮的点击事件
 	function listen_task_delete(){

 		$delete_task.on('click', function(){
 		var $this = $(this);
 		var $parent = $this.parents('li');
 		var tmp = confirm('确定删除？');
 		if (!tmp) return
 		delete_task($parent.data('index'))
 	})

 	}

 	function listen_task_detail(){
 		var index

 		$('.task-item').dblclick(function(){
 		 			index = $(this).data('index');
 		 			show_task_detail(index);
 		 		})

 		$task_detail_trigger.on('click',function(){
 			var $this = $(this);
 			var $parent = $this.parents('li');
 			index = $parent.data('index')
 			show_task_detail(index);

 		})

 	}

 	$task_detail_mask.on('click',hide_task_detail);

 	//监听完成Task事件
 	function listen_checkbox_complete(){
 		$checkbox_complete.on('click',function(){

 			var $this = $(this);
 			var index = $this.parents('li').data('index');
 			var item = store.get('task_list')[index];
 			if(item.complete){
 				update_task(index,{complete:false});
 			}else{
 				update_task(index,{complete:true});
 			}
 		})


 	}


 	//查看Task详情
 	function show_task_detail(index){
 		//生成详情模板
 		render_task_detail(index);
 		//显示详情模板
 		$task_detail.show();
 		$task_detail_mask.show();
 	}

 	//更新Task-list
 	function update_task(index, data){
 		if (index===undefined || !task_list[index])
 			return;

 		task_list[index] = $.extend({}, task_list[index], data);
 		refresh_task_list();
 	}

 	function hide_task_detail(){
 		$task_detail.hide();
 		$task_detail_mask.hide();
 	}


 	//渲染指定Task的详细信息
 	function render_task_detail(index){
 		if (index === undefined || !task_list[index]) return;

 		$task_detail.html('');
 		var item = task_list[index];
 		console.log('item',item);
 		var task_detail_tpl ='<form>'+
 				'<div class="content">'+item.content+'</div>'+
 				'<div>'+
 				'<input style="display:none" type="text" name="content" value="'+(item.content || '')+'">'+
 				'</div>'+
 				'<div class="desc">'+
 				'<textarea name="desc">'+(item.desc ||'') +'</textarea>'+
 				'</div>'+
 				'<div class="remind">'+
 				'<label>提醒时间</label>'+
 				'<input class="datetime" name="remind_date" type="text" value="'+(item.time || '')+'">'+'</div>'+
 				'<div><button type="submit">更新</button></div>'+
 				'</form>';
 		$task_detail.html(task_detail_tpl);
 		$('.datetime').datetimepicker();
 		$update_form = $task_detail.find('form');
 		$task_detail_content = $update_form.find('.content');
 		$task_detail_content_input = $update_form.find('[name=content]');

 		$task_detail_content.on('click',function(){
 			$task_detail_content.hide();
 			$task_detail_content_input.show();
 		})

 		$update_form.on('submit',function(e){
 			e.preventDefault();
 			var data = {};
 			data.content = $(this).find('[name=content]').val();
 			data.desc = $(this).find('[name=desc]').val();
 			data.time = $(this).find('[name=remind_date]').val();
 			// console.log('data',data);
 			update_task(index, data);
 			hide_task_detail();
 		})

 	}


 	function add_task(new_task){

 		
 		//将新Task值推入Task_list中
 		task_list.push(new_task);
 		//更新localStorage
 		refresh_task_list();
 		return true;
 	}


 	//刷新localStorage数据并渲染模板
 	function refresh_task_list(){
 		store.set('task_list',task_list);
 		render_task_list();
 	}


 	//删除一条Task
 	function delete_task(index){
 		//如果没有index或是index不存在
 		if (!index || !task_list[index])return

 		task_list.splice(index,1);
 		//刷新task-list
 		refresh_task_list();
 		
 	}


 	function init(){
 		task_list = store.get('task_list') || [];
 		if (task_list.length){
 			render_task_list();
 			datetime_check();
 		}
 		
 	}

 	function datetime_check(){
 		var current_timestamp;

 		var tpl = setInterval(function(){

	 			for (var i = 0; i < task_list.length; i++) {
	 			var item = task_list[i], task_timestamp;
	 			if (!item || !item.time || item.informed) 
	 				continue;

	 			current_timestamp = (new Date()).getTime();
	 			task_timestamp = (new Date(item.time)).getTime();
	 			if (current_timestamp - task_timestamp >= 1){
	 				update_task(i, {informed:true});
	 				show_msg(item.content);
	 			}
	 		}
 		}, 300)
 		

 	}


 	function show_msg(msg){
 		if (!msg) return

 		$msg_content.html(msg);
 		$msg.show();
 		listen_msg_status();
 	}

 	function hide_msg(){
 		$msg.hide();
 	}


 	//渲染全部所有Task模板
 	function render_task_list(){
 		var $task_list = $('.task-list');
 		$task_list.html('');
 		var complete_list = [];

 		for (var i = 0; i < task_list.length; i++) {
 			var item = task_list[i];
 			if ( item && item.complete){
 				complete_list[i]=item;
 			}else{
 				var $task = task_list_item(task_list[i], i);	
 		 		$task_list.prepend($task);
 		 	}
 		 	
 		}

 		for (var j = 0; j < complete_list.length; j++) {
 			var $task = task_list_item(complete_list[j], j);
 			 if (!$task) continue
 				$task.addClass('completed');	
 		 		$task_list.append($task);
 		}
 		
 		
 		$delete_task = $('.action.delete');
 		$task_detail_trigger = $('.action.detail');
 		$checkbox_complete = $('.task-list .complete');
 		listen_task_delete();
 		listen_task_detail();
 		listen_checkbox_complete();
 		
 	} 


 	//渲染单条Task模板
 	function task_list_item(data,index){
 		if (!data || !index)return

 		var task_list_tpl = '<li class="task-item" data-index="'+index+'">'+
				'<span><input class="complete" '+ (data.complete?'checked':'') +' type="checkbox" ></span>'+
				'<span class="task-content">'+data.content+'</span>'+
				'<span class="fr">'+
				'<span class="action delete">删除</span>'+
				'<span class="action detail">详细</span>'+
				'</span>'+
				'</li>';
		return $(task_list_tpl);
 	}

 })();
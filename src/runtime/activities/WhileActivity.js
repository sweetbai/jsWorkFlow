﻿/*
* jsWorkFlow's core source code.
* 2012.03.29: Create By Yin Mingjun - email: yinmingjuncn@gmail.com
* 
* Copyright 2012,  Yin MingJun - email: yinmingjuncn@gmail.com
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
*/

Type.registerNamespace('jsWorkFlow.Activities');

//////////////////////////////////////////////////////////////////////////////////////////
//WhileActivity
//
//TO 开发者：
//    WhileActivity提供一个循环的执行体，通过conditionActivity来控制执行的循环条件，
// bodyActivity提供循环的执行体。
//    conditionActivity和bodyActivity都可以为空。
//
jsWorkFlow.Activities.WhileActivity = function jsWorkFlow_Activities_WhileActivity(conditionActivity, bodyActivity) {
    jsWorkFlow.Activities.WhileActivity.initializeBase(this);

    this.set_conditionActivity(conditionActivity);
    this.set_bodyActivity(bodyActivity);

    this._doEvalConditionCompleteHandler = Function.createDeledate(this, this.doEvalConditionCompleteHandler);
    this._doExecuteBodyCompleteHandler = Function.createDeledate(this, this.doExecuteBodyCompleteHandler);

};

function jsWorkFlow_Activities_WhileActivity$dispose() {
    jsWorkFlow.Activities.WhileActivity.callBaseMethod(this, 'dispose');
}

function jsWorkFlow_Activities_WhileActivity$get_conditionActivity() {
    return this._conditionActivity;
}

function jsWorkFlow_Activities_WhileActivity$set_conditionActivity(value) {
    this._conditionActivity = value;
}

function jsWorkFlow_Activities_WhileActivity$get_bodyActivity() {
    return this._bodyActivity;
}

function jsWorkFlow_Activities_WhileActivity$set_bodyActivity(value) {
    this._bodyActivity = value;
}


function jsWorkFlow_Activities_WhileActivity$doEvalCondition(context) {
    //如果没有设置条件，认为为false
    var activity = this._conditionActivity;

    if (!activity) {
        this.doExecuteBody(context, false);
        return;
    }

    //构造ActivityExecutor执行conditionActivity
    var application = context.get_application();
    var activityExecutor = new jsWorkFlow.ActivityExecutor(application, activity);

    //将上下文的数据存放在activityExecutor之中
    activityExecutor.parentContext = context;

    activityExecutor.add_postComplete(this._doEvalConditionCompleteHandler);

    //OK, kick activityExecutor to run!
    activityExecutor.execute();
}

function jsWorkFlow_Activities_WhileActivity$doEvalConditionCompleteHandler(eventArgs) {
    //根据condition的执行结果，来执行
    var context = eventArgs.get_context();
    var executor = context.get_executor();
    var parentContext = executor.parentContext;

    //从context取执行结果
    var condition = context.get_result();

    //将condition传递给doExecuteBody继续执行
    this.doExecuteBody(parentContext, condition);

}

function jsWorkFlow_Activities_WhileActivity$doExecuteBody(context, condition) {

    if (!condition) {
        //循环条件为false，结束while的执行
        $jwf.endActivity(context);
        return;
    }

    //true，执行bodyActivity
    var activity = this._bodyActivity;

    if (!activity) {
        //没有activity，跳过，回到while的条件检查
        this.doEvalCondition(context);
        return;
    }

    var application = context.get_application();
    var activityExecutor = new jsWorkFlow.ActivityExecutor(application, activity);

    //将上下文的数据存放在activityExecutor之中
    activityExecutor.parentContext = context;

    activityExecutor.add_postComplete(this._doExecuteBodyCompleteHandler);

    //OK, kick activityExecutor to run!
    activityExecutor.execute();
}

function jsWorkFlow_Activities_WhileActivity$doExecuteBodyCompleteHandler(eventArgs) {
    var context = eventArgs.get_context();
    var executor = context.get_executor();
    var parentContext = executor.parentContext;

    //将activity的执行解结果作为自身的结果
    var result = context.get_result();
    parentContext.set_result(result);

    //继续回到条件的检查点执行
    this.doEvalCondition(parentContext);
}

//activity的状态机的启动入口，自动驱动activity的状态机进入运行状态。
function jsWorkFlow_Activities_WhileActivity$execute(context) {
    jsWorkFlow.Activities.WhileActivity.callBaseMethod(this, 'execute', [context]);

    //从条件检查开始执行
    this.doEvalCondition(context);

}

jsWorkFlow.Activities.WhileActivity.prototype = {
    _conditionActivity: null,
    _bodyActivity: null,
    _doEvalConditionCompleteHandler: null,
    _doExecuteBodyCompleteHandler: null,
    //
    dispose: jsWorkFlow_Activities_WhileActivity$dispose,
    //property
    get_conditionActivity: jsWorkFlow_Activities_WhileActivity$get_conditionActivity,
    set_conditionActivity: jsWorkFlow_Activities_WhileActivity$set_conditionActivity,
    get_bodyActivity: jsWorkFlow_Activities_WhileActivity$get_bodyActivity,
    set_bodyActivity: jsWorkFlow_Activities_WhileActivity$set_bodyActivity,
    //method
    doEvalCondition: jsWorkFlow_Activities_WhileActivity$doEvalCondition,
    doEvalConditionCompleteHandler: jsWorkFlow_Activities_WhileActivity$doEvalConditionCompleteHandler,
    doExecuteBody: jsWorkFlow_Activities_WhileActivity$doExecuteBody,
    doExecuteBodyCompleteHandler: jsWorkFlow_Activities_WhileActivity$doExecuteBodyCompleteHandler,
    execute: jsWorkFlow_Activities_WhileActivity$execute
};

jsWorkFlow.Activities.WhileActivity.registerClass('jsWorkFlow.Activities.WhileActivity', jsWorkFlow.Activity);


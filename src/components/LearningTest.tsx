import React, { useEffect, useState } from "react";

//Task 1 - Counter
// 请写一个 React 函数组件：
// 使用 useState 声明一个 count，初始值是 0
// 渲染当前 count 数字
// 有两个按钮：
// +1：点击后让 count 增加 1
// -1：点击后让 count 减少 1

// const LearningTest: React.FC = () => {
//     const [count,setCount] = useState<number>(0);
// return(
//     <div>
//     <p>current number is{count} </p>
//     <button 
//     onClick={()=>setCount(count+1)}> +1 button
//     </button>
//     <button 
//     onClick={()=>setCount(count-1)}> -1 button
//     </button>
//       <button 
//     onClick={()=>setCount(0)}>  reset to 0
//     </button>

//     </div>
// );

// };

// export default Test;
//I want to take some notes so () => {} means it's an function with no parameters. and SetCount is a function so that's why it wrote setCount(count-1)
//{} is Syntactic sugar for jsx 
//useState 用来在函数组件中添加“状态”。在 React 里，组件通常会根据“状态”来决定显示什么内容，比如是否显示一个菜单、用户输入的文本等等
//useEffect 用来处理副作用。“副作用”指的是那些不直接影响 UI 渲染，但组件中仍然需要的行为
//useEffect is a React Hook that lets you synchronize a component with an external system.



// 🧪 第 2 阶段练习任务：Timer
// 请写一个组件，功能如下：
// 页面上有一个数字（从 0 开始）
// 每 1 秒数字 +1（使用 setInterval）
// 当组件卸载时要清理定时器（防止内存泄漏）
// useState 存储当前秒数
// useEffect 来设置计时器和清理它
// 在 useEffect 中返回一个函数用于清理（清除 setInterval）
// const LearningTest: React.FC = () => {
//     const [count,setCount] = useState<number>(0);
    
//     useEffect(()=>{
//         const timer = setInterval(()=>setCount(x=>x+1), 1000);
//         setTimeout(()=>{
//         clearInterval(timer);
//         }, 5000);
//         return () => {
//       setTimeout;
//     };
//     },[]

//     )

// return(
//     <div>
//     <p>Seconds passed: {count} </p>
//     </div>
// );

// };


///Task2 notes taking:
//为什么 useEffect 里要 return 一个函数？因为需要返回一个“清理函数”告诉 React “组件卸载时要执行的清理动作”。
//what's difference between const and let?const 声明的变量不能被重新赋值，但可以修改对象/数组内容。let 是可以重新赋值的变量。
//当你在 useEffect(() => { ... }, []) 中写定时器时，它只运行一次，所以函数内部捕获的 count 是初始值，不会更新。　so we write as prev => prev + 1, which is like parem => return 

//Task 3：SearchLogger
//输入框 + useEffect 实时响应变化，打印日志。

const LearningTest: React.FC = () =>{
    const [input, setInput] = useState<string>("");
    useEffect(()=>{
        if(input.trim() !== ""){
            console.log(`You typed: ${input}`);
        }
    },[input]);
    return(
        <div>
        <input
        value = {input}
        onChange = {(e) => setInput(e.target.value)}
        placeholder="Please type..."
        />
        </div>
    )
};

export default LearningTest;
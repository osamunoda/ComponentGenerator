# ComponentGenerator

This is a tool for constructing integration code of SortByDrag3(WebViewer Component) in the browser( Safari/Chrome not IE ). 
index.html and bundle.js in public are main files. When usig as a single file, merge bundle.js into index.html.

HOW TO USE: https://twitter.com/sam_oda/status/1160280200120172544
*********************************************************************

What is the ideal way to implement WebViewer component?
Generally speaking, I think there are 3 points to achieve.

1. Minimum intervention to database scheme
2. No contamination to global area
3. Easy integration

Though it is easy to achieve in the case where FileMaker - WebViewer interaction is one way only, it becomes difficult when thinking about 2 way interaction.
Where should we save HTML code for WebViewer?
Where should we save the changes of inner conditions of WebViewer? 
Forcing users to use Database fields makes integration more difficult and more complex.
How should we get datasource of WebViewer?
Using calculation with relationship forces us to think context. It also can be a factor of complexity.

To solve these problems, I adopt the followings.

1. Use data-scheme implementation (not exporting HTML file to temporary)  
Of course, I DON'T insist ALWAYS DO IT. There are cases where exporting HTML file is suitable at the expense of compexity.
2. Use local variables to communicate between FileMaker and WebViewer
To make it possible, the following comes.
3. Use 'Set WebViewer' script step with option 'Go to URL'  
Integration code of FileMaker and HTML code are placed there. But it is a hassle for us to go there every time when changing the code.
And there is a limitation of characters length in the FileMaker calculation formula. So I put those codes as TEXT object in the layout.
In the 'Go To URL' formula, we can refer those codes using GetLayoutObjectAttribute function and evaluate.
4. Use ExecuteSQL to get data.  
It frees us from thinking context.
5. Use Wizard-way to contruct integration code of FileMaker.(This tool comes here)  
Constructing SQL query string by hand is error-prone.(especially in the multi-bytes environment)

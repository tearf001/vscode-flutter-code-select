# inspired/forked from *chunsen.bracket-select*
add Flutter Widget select support;

# Code area Select
This is a simple plugin that support to quick select 
````
text between matched brackets.  
This plugin support `()`, `{}` and `[]`,`""`, `''`.
In dart/flutter world , support 'new WidgetConstructor(....@cursor-inside....)' 
Really hope this plugin can help you!
````


## Quick start
Just run command `FluSel:Select` or type `alt+a` to select text between brackets.     
If you wish to select more, just press it again.
  
If you wish to select text including the brackets, just run `FluSel:SelectInclude`     
or type `cmd+alt+a` on mac and `ctrl+alt+a` on windows.

If you wish to select Flutter Widget, just run `FluSel:WidgetInclude`     
or type `ctrl+alt+w` on mac and `ctrl+alt+w` on windows,note: you must do widget-select *inside* a widget
# todo  more smart selection, 
````
1.select focused widget (i.e constructor call). 
2.includes ending delimeter
3.function body select
4.more on flutter code sections 

````
## Requirements
None

## Extension Settings


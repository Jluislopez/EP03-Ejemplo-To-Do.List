
$(function() {
    var i = Number(localStorage.getItem('todo-counter')) + 1,
        j = 0,
        k,
        $form = $('#form'),
        $removeLink = $('#lista li a'),
        $itemList = $('#lista'),
        $editable = $('.editable'),
        $newTodo = $('#todo'),
        order = [],
        orderList;

    orderList = localStorage.getItem('todo-orders');
    orderList = orderList ? orderList.split(',') : [];
    
    for( j = 0, k = orderList.length; j < k; j++) {
        $itemList.append(
            "<li id='" + orderList[j] + "'>"
            + "<span class='editable'>" 
            + localStorage.getItem(orderList[j]) 
            + "</span> <a href='#'>X</a></li>"
        );
    }
        
  //agrega
    $form.submit(function(e) {
        e.preventDefault();
        $.publish('/add/', []);
    });

    // elimina
    $itemList.delegate('a', 'click', function(e) {
        var $this = $(this);
        
        e.preventDefault();
        $.publish('/remove/', [$this]);
    });
    
    // actualiza
    $itemList.sortable({
        revert: true,
        stop: function() {
            $.publish('/regenerate-list/', []);
        }
    });
    
    // edita
    $editable.inlineEdit({
        save: function(e, data) {
                var $this = $(this);
                localStorage.setItem(
                    $this.parent().attr("id"), data.value
                );
            }

    });

   
    $itemList.delegate('li', 'mouseover mouseout', function(event) {
        var $this = $(this).find('a');
        
        if(event.type === 'mouseover') {
            $this.stop(true, true).fadeIn();
        } else {
            $this.stop(true, true).fadeOut();
        }
    });
       
    $.subscribe('/add/', function() {
        if ($newTodo.val() !== "") {
            localStorage.setItem( 
                "todo-" + i, $newTodo.val() 
            );
            
            localStorage.setItem('todo-counter', i);
            
            // nuevo item
            $itemList.append(
                "<li id='todo-" + i + "'>"
                + "<span class='editable'>"
                + localStorage.getItem("todo-" + i) 
                + " </span><a href='#'>x</a></li>"
            );

            $.publish('/regenerate-list/', []);

            $("#todo-" + i)
                .css('display', 'false')
                .fadeIn();
            
            $newTodo.val("");
            
            i++;
        }
    });
    
    $.subscribe('/remove/', function($this) {
        var parentId = $this.parent().attr('id');
        localStorage.removeItem(
            "'" + parentId + "'"
        );
        
        $this.parent().fadeOut(function() { 
            $this.parent().remove();
            
            $.publish('/regenerate-list/', []);
        });
    });
    
    $.subscribe('/regenerate-list/', function() {
        var $todoItemLi = $('#lista li');
        order.length = 0;
        
        $todoItemLi.each(function() {
            var id = $(this).attr('id');
            order.push(id);
        });
        
        localStorage.setItem(
            'todo-orders', order.join(',')
        );
    });
  
});

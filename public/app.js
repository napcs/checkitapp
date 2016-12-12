var db = null;

$(function(){
  
  $("#notice").hide();
  
  connect();
  load();
  
    
  $("#tasks").click(function(event){
    if ($(event.target).is('input[type=button]')) {
      var element = $(event.target);
      destroyTask(element);  
    }
    
    if ($(event.target).is('input[type=checkbox]')) {
      var element = $(event.target);
      updateTask(element);
    };
  });

  $("#new_form").submit(function(e){
    e.preventDefault();
    var textfield = $("#task");
    
    var name = textfield.val();
    insertTask(name);
    
    textfield.val("");

  });

});

removeTaskRow = function(id){
  $("#task_" + id).remove();
  showNotice("Removed the task!");
}

updateTask = function(element){
  var id = element.attr("data-id");
  var complete = element.attr("checked");
  
  db.transaction(function(tx) {
    tx.executeSql('UPDATE tasks SET complete = ? WHERE id = ?', [complete, id], function(tx, result){
      
      if(element.attr('checked')){
        element.parent().addClass("disabled");
        showNotice("Task has been finished!");
      }else{
        element.parent().removeClass("disabled");
        showNotice("Task needs more work!");
        
      }
      
    });
  
  });
}


//remove record from Table.
destroyTask = function(element)
{
   var id = element.attr("data-id");
   
   db.transaction(function(tx){
      tx.executeSql("DELETE from tasks where id = ?", [id],
        function(tx, result){ 
          removeTaskRow(id);
        },
        function(){ 
         setErrors('The record was not deleted!');
        }
      );
   });

};



// Insert a task into the database. Returns the id
// of the record that was inserted.
insertTask = function(name){
  db.transaction(function(tx) {
  
    tx.executeSql('INSERT INTO tasks (name, complete) values (?, ?)', [name, false], function(tx, result){
      
      if(!result.rowsAffected){
        showError("Insert failed!");
      }else{
        id = result.insertId;
        showNotice("Task has been added to your list of items");
        addTaskToTable(name, id);

      }
      
    });
  
  });
}

// Adds the table row, label, and checkbox to the
// tasks table. Used on create and on loading.
addTaskToTable = function(name, id, checked){
  $("#tasks").find('tbody')
    .append($('<tr>').attr("id", 'task_' + id)
        .append($('<td>')
            .append($('<label>')
              .append($("<input type='checkbox'>")
                .attr('data-id', id)
                .attr("checked", checked == "true" ? "checked" : "")
              )
              .append(name)
              .attr("class", checked == "true" ? "disabled" : "")
              
            )
            .append($("<input type='button' value='delete'>").attr("data-id", id))
            
    )
  );
}



load = function(){
  db.transaction(function(tx) {
      tx.executeSql("SELECT id, name, complete FROM tasks", [], function(tx, result) {
          for (var i = 0; i < result.rows.length; ++i) {
              var row = result.rows.item(i);
              var id = row['id'];
              var name = row['name'];
             // var complete = row['complete'];
              checked = row['complete'];
              addTaskToTable(name, id, checked);
          }

      }, function(tx, error) {
          showErrors('Failed to retrieve tasks from database - ' + error.message);
          return;
      });
  });
  
          
}

// Makes a connection to the database and creates
// the table 'tasks' if it's not found.
connect = function() {
  try {
    if (window.openDatabase) {
      db = openDatabase("checkit", "1.0", "CheckIt Database", 200000);
      if (db) {
        db.transaction(function(tx) {
          tx.executeSql("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, complete BOOLEAN)", [], function (tx, result) {           
          });
        });
        showNotice("All set!");
        
        
      } else {
        showErrors('error occurred trying to open DB');
      }
    } else {
      showErrors('Local Web Databases not supported');
    }
  } catch (e) {
    showErrors('error occurred during DB init, Web Database supported?');
  }
}

showNotice = function(msg){
  $("#notice").removeClass("error");
  $("#notice").html(msg);
  $("#notice").slideDown();
}

showErrors = function(msg){
  showNotice(msg);
  $("#notice").addClass("error");
}
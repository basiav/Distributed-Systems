package services.rest.ex3;

import services.rest.model.Todo;

import java.util.HashMap;
import java.util.Map;

public class TodoDao {
    private static final Map<String, Todo> contentProvider = new HashMap<>();
    static {
        Todo todo = new Todo("1", "Learn REST theory");
        todo.setDescription("Attend the REST lecture on the TAI course");
        contentProvider.put("1", todo);
        todo = new Todo("2", "Learn REST practice");
        todo.setDescription("Attend the REST laboratory on the TAI course");
        contentProvider.put("2", todo);
    }
    public static Map<String, Todo> getModel() {
        return contentProvider;
    }
}

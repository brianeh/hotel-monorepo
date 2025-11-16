package rest;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

/**
 * JAX-RS Application configuration
 * 
 * This configuration disables MOXy JSON provider and allows Jersey
 * to use Jackson for JSON parsing instead.
 */
@ApplicationPath("api")
public class ApplicationConfig extends Application {

    @Override
    public Map<String, Object> getProperties() {
        Map<String, Object> props = new HashMap<>();
        // Disable MOXy JSON provider - this will make Jersey use Jackson
        props.put("jersey.config.server.disableMoxyJson", true);
        return props;
    }
}

<<<<<<< HEAD
package com.dangkhoa.superapp.swp391_fa25.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration // config dự án nhe
public class SwaggerConfig {
    public OpenAPI customSwagger(){
        return new OpenAPI()
                .info(new Info().description("SWP391FA25binding"))
                .addServersItem(new Server().url("http://localhost:8080/")
                        .description("Server localhost"));
    }
}
=======
package com.dangkhoa.superapp.swp391_fa25.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration // config dự án nhe
public class SwaggerConfig {
    public OpenAPI customSwagger(){
        return new OpenAPI()
                .info(new Info().description("SWP391FA25binding"))
                .addServersItem(new Server().url("http://localhost:8080/")
                        .description("Server localhost"));
    }
}
>>>>>>> 1ebd13cbb96164f00dc43c0f7424e476f56247ab

package cl.mesatech.bff.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/health",
                                "/error")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/v1/solicitudes"
                        )
                        .hasAnyRole(
                                "CLIENTE",
                                "OPERADOR",
                                "ADMINISTRADOR"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/v1/solicitudes/mias"
                        )
                        .hasAnyRole(
                                "CLIENTE",
                                "OPERADOR",
                                "ADMINISTRADOR"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/v1/solicitudes/categorias"
                        )
                        .hasAnyRole(
                                "CLIENTE",
                                "OPERADOR",
                                "ADMINISTRADOR"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/v1/solicitudes"
                        )
                        .hasAnyRole(
                                "OPERADOR",
                                "ADMINISTRADOR"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/v2/solicitudes"
                        )
                        .hasAnyRole(
                                "OPERADOR",
                                "ADMINISTRADOR"
                        )

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/v1/solicitudes/{id}/estado"
                        )
                        .hasAnyRole(
                                "OPERADOR",
                                "ADMINISTRADOR"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/v1/catalogo/**"
                        )
                        .hasAnyRole(
                                "CLIENTE",
                                "OPERADOR",
                                "ADMINISTRADOR"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/v1/catalogo/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/v1/catalogo/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/v1/catalogo/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        .anyRequest()
                        .denyAll()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                )
                        )
                );
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtAuthenticationConverter jwtConverter =
                new JwtAuthenticationConverter();

        jwtConverter.setJwtGrantedAuthoritiesConverter(jwt -> {

            List<GrantedAuthority> authorities =
                    new ArrayList<>();

            // Scope de Microsoft Entra ID
            String scopes = jwt.getClaimAsString("scp");

            if (scopes != null && !scopes.isBlank()) {
                for (String scope : scopes.split(" ")) {
                    authorities.add(
                            new SimpleGrantedAuthority(
                                    "SCOPE_" + scope
                            )
                    );
                }
            }

            // Roles de Microsoft Entra ID
            List<String> roles =
                    jwt.getClaimAsStringList("roles");

            if (roles != null) {
                for (String role : roles) {
                    authorities.add(
                            new SimpleGrantedAuthority(
                                    "ROLE_" + role
                            )
                    );
                }
            }

            return authorities;
        });

        return jwtConverter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of("http://localhost:5173"));

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}

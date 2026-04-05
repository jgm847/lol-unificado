package com.example.demo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.Champion;
import com.example.demo.repository.ChampionRepository;

@RestController
@RequestMapping("/custom/champions")
@CrossOrigin(origins = "*")
public class ChampionController {

    private final ChampionRepository championRepository;

    public ChampionController(ChampionRepository championRepository) {
        this.championRepository = championRepository;
    }

    @GetMapping
    public List<Champion> getTodosLosCampeones(@RequestParam(required = false) String search) {
        if (search == null || search.isBlank()) {
            return championRepository.findAll();
        }
        return championRepository.findByNombreContainingIgnoreCase(search.trim());
    }

    @GetMapping("/{id}")
    public Champion getCampeonPorId(@PathVariable Long id) {
        return championRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campeón no encontrado"));
    }

    @GetMapping("/name/{nombre}")
    public List<Champion> getCampeonesPorNombre(@PathVariable String nombre) {
        return championRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<Champion> guardarTodosLosCampeones(@RequestBody List<Champion> campeones) {
        championRepository.deleteAllInBatch();
        List<Champion> saneados = new ArrayList<>();

        for (Champion campeon : campeones) {
            if (campeon == null || campeon.getNombre() == null || campeon.getNombre().isBlank()) {
                continue;
            }
            campeon.setId(null);
            if (campeon.getHabilidades() != null) {
                campeon.getHabilidades().forEach(skill -> skill.setId(null));
            }
            saneados.add(campeon);
        }

        return championRepository.saveAll(saneados);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarTodosLosCampeones() {
        championRepository.deleteAllInBatch();
    }
}

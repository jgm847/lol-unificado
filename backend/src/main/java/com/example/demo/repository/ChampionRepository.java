package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Champion;

public interface ChampionRepository extends JpaRepository<Champion, Long> {

    List<Champion> findByNombreContainingIgnoreCase(String nombre);

    Optional<Champion> findByNombreIgnoreCase(String nombre);
}

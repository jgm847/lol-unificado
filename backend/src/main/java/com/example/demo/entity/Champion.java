package com.example.demo.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "champions", uniqueConstraints = @UniqueConstraint(columnNames = "nombre"))
public class Champion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String urlImagenCampeon;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String fechaLanzamiento;
    private String ultimoCambio;
    private Integer esenciaAzul;
    private Integer riotPoints;
    private String lolUrl;

    @ElementCollection
    @CollectionTable(name = "champion_classes", joinColumns = @JoinColumn(name = "champion_id"))
    @Column(name = "clase")
    private List<String> clases = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "champion_id")
    @OrderBy("habilidad ASC")
    private List<Skill> habilidades = new ArrayList<>();

    public Champion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrlImagenCampeon() {
        return urlImagenCampeon;
    }

    public void setUrlImagenCampeon(String urlImagenCampeon) {
        this.urlImagenCampeon = urlImagenCampeon;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getFechaLanzamiento() {
        return fechaLanzamiento;
    }

    public void setFechaLanzamiento(String fechaLanzamiento) {
        this.fechaLanzamiento = fechaLanzamiento;
    }

    public String getUltimoCambio() {
        return ultimoCambio;
    }

    public void setUltimoCambio(String ultimoCambio) {
        this.ultimoCambio = ultimoCambio;
    }

    public Integer getEsenciaAzul() {
        return esenciaAzul;
    }

    public void setEsenciaAzul(Integer esenciaAzul) {
        this.esenciaAzul = esenciaAzul;
    }

    public Integer getRiotPoints() {
        return riotPoints;
    }

    public void setRiotPoints(Integer riotPoints) {
        this.riotPoints = riotPoints;
    }

    public String getLolUrl() {
        return lolUrl;
    }

    public void setLolUrl(String lolUrl) {
        this.lolUrl = lolUrl;
    }

    public List<String> getClases() {
        return clases;
    }

    public void setClases(List<String> clases) {
        this.clases = clases;
    }

    public List<Skill> getHabilidades() {
        return habilidades;
    }

    public void setHabilidades(List<Skill> habilidades) {
        this.habilidades = habilidades;
    }
}

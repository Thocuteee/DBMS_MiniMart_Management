package com.sieuthi.demo.security;

import com.sieuthi.demo.model.NhanVien;
import com.sieuthi.demo.dto.response.KhachHangResponse;
import com.sieuthi.demo.repository.NhanVienRepository;
import com.sieuthi.demo.repository.KhachHangRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final NhanVienRepository nhanVienRepository;
    private final KhachHangRepository khachHangRepository;

    public UserDetailsServiceImpl(NhanVienRepository nhanVienRepository, KhachHangRepository khachHangRepository) {
        this.nhanVienRepository = nhanVienRepository;
        this.khachHangRepository = khachHangRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            NhanVien nv = nhanVienRepository.findByUserName(username);
            if (nv != null) {
                String rawRole = nv.getRole();
                String roleStr = "ROLE_NHAN_VIEN";

                if (rawRole != null) {
                    if (rawRole.equals("1") || rawRole.equalsIgnoreCase("Quản Lý") || rawRole.equalsIgnoreCase("Admin")) {
                        roleStr = "ROLE_ADMIN";
                    } else if (rawRole.equalsIgnoreCase("Thu Ngân")) {
                        roleStr = "ROLE_THU_NGAN";
                    } else if (rawRole.equalsIgnoreCase("Thủ Kho")) {
                        roleStr = "ROLE_THU_KHO";
                    } else if (rawRole.equals("2") || rawRole.equalsIgnoreCase("Nhân Viên")) {
                        roleStr = "ROLE_NHAN_VIEN";
                    }
                }

                if (username.equals("admin")) roleStr = "ROLE_ADMIN";

                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleStr));
                return new CustomUserDetails(nv.getUserName(), nv.getPassword(), authorities);
            }

            KhachHangResponse kh = khachHangRepository.findByPhone(username);
            if (kh != null) {
                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_KHACH_HANG"));
                PasswordEncoder encoder = new BCryptPasswordEncoder();
                return new CustomUserDetails(kh.getPhone(), encoder.encode(kh.getPhone()), authorities);
            }

        } catch (Exception e) {
            throw new UsernameNotFoundException("Database error: " + e.getMessage());
        }

        throw new UsernameNotFoundException("User Not Found with username: " + username);
    }
}

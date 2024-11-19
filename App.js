import React, { useState, useEffect } from 'react';  
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet } from 'react-native';  
import { NavigationContainer } from '@react-navigation/native';  
import { createStackNavigator } from '@react-navigation/stack';  
import { createClient } from '@supabase/supabase-js';  

// Configurações do Supabase  
const SUPABASE_URL = 'https://pjtmpzqapslqkzlwnnzq.supabase.co';  
const SUPABASE_KEY = 'SUPABASE_KEY';  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);  

const Stack = createStackNavigator();  

// Função para validar email  
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);  

// Tela de Login  
const LoginScreen = ({ navigation }) => {  
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');  
  const [error, setError] = useState('');  

  const handleLogin = async () => {  
    setError('');  
    if (!email || !password) {  
      setError('Preencha todos os campos.');  
      return;  
    }  
    if (!validateEmail(email)) {  
      setError('E-mail inválido.');  
      return;  
    }  

    try {  
      const { data, error: queryError } = await supabase  
        .from('alunos')  
        .select('*')  
        .eq('email', email)  
        .eq('senha', password)  
        .single();  

      if (queryError || !data) {  
        console.error('Erro ao consultar:', queryError);  
        setError('Erro ao fazer login. Verifique suas credenciais.');  
        return;  
      }  

      // Login bem-sucedido  
      navigation.navigate('Home');  
    } catch (err) {  
      console.error('Erro inesperado:', err);  
      setError('Erro ao fazer login. Tente novamente.');  
    }  
  };  

  return (  
    <View style={styles.container}>  
      <Text style={styles.title}>Login</Text>  
      <TextInput  
        style={styles.input}  
        placeholder="Email"  
        value={email}  
        onChangeText={setEmail}  
        keyboardType="email-address"  
      />  
      <TextInput  
        style={styles.input}  
        placeholder="Senha"  
        value={password}  
        onChangeText={setPassword}  
        secureTextEntry  
      />  
      {error ? <Text style={styles.errorText}>{error}</Text> : null}  
      <TouchableOpacity style={styles.button} onPress={handleLogin}>  
        <Text style={styles.buttonText}>Logar</Text>  
      </TouchableOpacity>  
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>  
        <Text style={styles.link}>Registrar-se</Text>  
      </TouchableOpacity>  
      <TouchableOpacity onPress={() => navigation.navigate('PasswordRecovery')}>  
        <Text style={styles.link}>Esqueceu a senha?</Text>  
      </TouchableOpacity>  
    </View>  
  );  
};  

// Tela de Registro  
const RegisterScreen = ({ navigation }) => {  
  const [name, setName] = useState('');  
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');  
  const [error, setError] = useState('');  
  const [successMessage, setSuccessMessage] = useState('');  

  const handleRegister = async () => {  
    setError('');  
    if (!name || !email || !password) {  
      setError('Preencha todos os campos.');  
      return;  
    }  
    if (!validateEmail(email)) {  
      setError('E-mail inválido.');  
      return;  
    }  

    try {  
      const { error: insertError } = await supabase  
        .from('alunos')  
        .insert([{ nome: name, email, senha: password, grupo_id: 1 }]);  

      if (insertError) {  
        console.error('Erro ao registrar:', insertError);  
        setError('Erro ao registrar. Tente novamente.');  
        return;  
      }  

      setSuccessMessage('Registro feito com sucesso!');  
      setTimeout(() => navigation.navigate('Login'), 2000);  
    } catch (err) {  
      console.error('Erro inesperado:', err);  
      setError('Erro ao registrar. Tente novamente.');  
    }  
  };  

  return (  
    <View style={styles.container}>  
      <Text style={styles.title}>Registro</Text>  
      <TextInput  
        style={styles.input}  
        placeholder="Nome"  
        value={name}  
        onChangeText={setName}  
      />  
      <TextInput  
        style={styles.input}  
        placeholder="Email"  
        value={email}  
        onChangeText={setEmail}  
        keyboardType="email-address"  
      />  
      <TextInput  
        style={styles.input}  
        placeholder="Senha"  
        value={password}  
        onChangeText={setPassword}  
        secureTextEntry  
      />  
      {error ? <Text style={styles.errorText}>{error}</Text> : null}  
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}  
      <TouchableOpacity style={styles.button} onPress={handleRegister}>  
        <Text style={styles.buttonText}>Registrar</Text>  
      </TouchableOpacity>  
    </View>  
  );  
};  

// Tela Home - Lista de Grupos  
const HomeScreen = ({ navigation }) => {  
  const [grupos, setGrupos] = useState([]);  

  useEffect(() => {  
    const fetchGrupos = async () => {  
      const { data, error } = await supabase.from('grupos').select('*');  
      if (error) {  
        console.error('Erro ao carregar grupos:', error);  
        return;  
      }  
      setGrupos(data);  
    };  
    fetchGrupos();  
  }, []);  

  return (  
    <View style={styles.container}>  
      <Text style={styles.title}>Grupos</Text>  
      <FlatList  
        data={grupos}  
        keyExtractor={(item) => item.id.toString()}  
        renderItem={({ item }) => (  
          <TouchableOpacity  
            onPress={() => navigation.navigate('GroupDetails', { grupo: item })}  
          >  
            <Text style={styles.item}>{item.nome}</Text>  
          </TouchableOpacity>  
        )}  
      />  
    </View>  
  );  
};  

// Tela de Detalhes do Grupo  
const GroupDetailsScreen = ({ route }) => {  
  const { grupo } = route.params;  
  const [alunos, setAlunos] = useState([]);  
  const [avaliacoes, setAvaliacoes] = useState([]);  

  useEffect(() => {  
    const fetchDetails = async () => {  
      const { data: alunosData, error: alunosError } = await supabase  
        .from('alunos')  
        .select('*')  
        .eq('grupo_id', grupo.id);  

      const { data: avaliacoesData, error: avaliacoesError } = await supabase  
        .from('avaliacoes')  
        .select('*')  
        .eq('grupo_id', grupo.id);  

      if (alunosError || avaliacoesError) {  
        console.error('Erro ao carregar detalhes do grupo:', alunosError || avaliacoesError);  
        return;  
      }  

      setAlunos(alunosData);  
      setAvaliacoes(avaliacoesData);  
    };  
    fetchDetails();  
  }, [grupo.id]);  

  return (  
    <View style={styles.container}>  
      <Text style={styles.title}>Detalhes do Grupo: {grupo.nome}</Text>  
      <Text style={styles.subtitle}>Alunos:</Text>  
      {alunos.map((aluno) => (  
        <Text key={aluno.id} style={styles.item}>{aluno.nome}</Text>  
      ))}  
      <Text style={styles.subtitle}>Avaliações:</Text>  
      {avaliacoes.map((avaliacao) => (  
        <Text key={avaliacao.id} style={styles.item}>{avaliacao.nome}</Text>  
      ))}  
    </View>  
  );  
};  

// Nova tela de Recuperação de Senha  
const PasswordRecoveryScreen = ({ navigation }) => {  
  const [email, setEmail] = useState('');  
  const [groupName, setGroupName] = useState('');  
  const [newPassword, setNewPassword] = useState('');  
  const [error, setError] = useState('');  
  const [message, setMessage] = useState('');  
  const [showPasswordReset, setShowPasswordReset] = useState(false);  

  const handleVerifyUser = async () => {  
    setError('');  
    setMessage('');  

    if (!email || !groupName) {  
      setError('Por favor, preencha todos os campos.');  
      return;  
    }  

    try {  
      // Primeiro, encontra o grupo pelo nome  
      const { data: groupData, error: groupError } = await supabase  
        .from('grupos')  
        .select('id')  
        .eq('nome', groupName)  
        .single();  

      if (groupError || !groupData) {  
        setError('Grupo não encontrado.');  
        return;  
      }  

      // Então, verifica se o aluno existe neste grupo  
      const { data: studentData, error: studentError } = await supabase  
        .from('alunos')  
        .select('id')  
        .eq('email', email)  
        .eq('grupo_id', groupData.id)  
        .single();  

      if (studentError || !studentData) {  
        setError('Aluno não encontrado no grupo especificado.');  
        return;  
      }  

      // Se chegamos aqui, o aluno existe no grupo especificado  
      setShowPasswordReset(true);  
      setMessage('Verificação bem-sucedida. Você pode redefinir sua senha agora.');  
    } catch (err) {  
      console.error('Erro inesperado:', err);  
      setError('Ocorreu um erro. Por favor, tente novamente.');  
    }  
  };  

  const handleResetPassword = async () => {  
    setError('');  
    setMessage('');  

    if (!newPassword) {  
      setError('Por favor, insira a nova senha.');  
      return;  
    }  

    try {  
      const { error: updateError } = await supabase  
        .from('alunos')  
        .update({ senha: newPassword })  
        .eq('email', email);  

      if (updateError) {  
        setError('Erro ao atualizar a senha. Por favor, tente novamente.');  
        return;  
      }  

      setMessage('Senha atualizada com sucesso!');  
      setTimeout(() => navigation.navigate('Login'), 2000);  
    } catch (err) {  
      console.error('Erro inesperado:', err);  
      setError('Ocorreu um erro. Por favor, tente novamente.');  
    }  
  };  

  return (  
    <View style={styles.container}>  
      <Text style={styles.title}>Recuperação de Senha</Text>  
      <TextInput  
        style={styles.input}  
        placeholder="Email"  
        value={email}  
        onChangeText={setEmail}  
        keyboardType="email-address"  
        editable={!showPasswordReset}  
      />  
      <TextInput  
        style={styles.input}  
        placeholder="Nome do Grupo"  
        value={groupName}  
        onChangeText={setGroupName}  
        editable={!showPasswordReset}  
      />  
      {!showPasswordReset && (  
        <TouchableOpacity style={styles.button} onPress={handleVerifyUser}>  
          <Text style={styles.buttonText}>Verificar</Text>  
        </TouchableOpacity>  
      )}  
      {showPasswordReset && (  
        <>  
          <TextInput  
            style={styles.input}  
            placeholder="Nova Senha"  
            value={newPassword}  
            onChangeText={setNewPassword}  
            secureTextEntry  
          />  
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>  
            <Text style={styles.buttonText}>Redefinir Senha</Text>  
          </TouchableOpacity>  
        </>  
      )}  
      {error ? <Text style={styles.errorText}>{error}</Text> : null}  
      {message ? <Text style={styles.success}>{message}</Text> : null}  
    </View>  
  );  
};  

// Estilos  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    padding: 20,  
    backgroundColor: 'white',  
  },  
  title: {  
    fontSize: 24,  
    fontWeight: 'bold',  
    marginBottom: 16,  
    color: '#457B9D',  
  },  
  subtitle: {  
    fontSize: 20,  
    marginTop: 16,  
    marginBottom: 8,  
    color: '#1D3557',  
  },  
  input: {  
    width: '100%',  
    height: 40,  
    borderWidth: 1,  
    borderColor: '#FFB6C1',  
    marginBottom: 10,  
    paddingHorizontal: 10,  
    backgroundColor: '#FFFFFF',  
    borderRadius: 10,  
  },  
  item: {  
    padding: 10,  
    borderBottomWidth: 1,  
    borderColor: '#ccc',  
  },  
  errorText: {  
    color: 'red',  
    marginBottom: 10,  
  },  
  success: {  
    color: '#2A9D8F',  
    marginBottom: 10,  
    textAlign: 'center',  
  },  
  button: {  
    padding: 10,  
    width: '100%',  
    alignItems: 'center',  
    marginBottom: 10,  
    backgroundColor: '#FF69B4',  
    borderRadius: 10,  
  },  
  buttonText: {  
    color: 'white',  
    fontWeight: 'bold',  
  },  
  link: {  
    marginTop: 10,  
    color: '#CA1187',  
  },  
});  

// Navegação  
const App = () => (  
  <NavigationContainer>  
    <Stack.Navigator initialRouteName="Login">  
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />  
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro' }} />  
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />  
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ title: 'Detalhes do Grupo' }} />  
      <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} options={{ title: 'Recuperar Senha' }} />  
    </Stack.Navigator>  
  </NavigationContainer>  
);  

export default App;
